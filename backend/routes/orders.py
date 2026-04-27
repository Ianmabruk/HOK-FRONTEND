from flask import Blueprint, request, jsonify
from models.models import db, Order, OrderItem, Product
from flask_jwt_extended import jwt_required
from decimal import Decimal, ROUND_HALF_UP

from auth_utils import current_user_id, current_user_role

orders_bp = Blueprint('orders', __name__)


@orders_bp.post('/orders')
@jwt_required()
def create_order():
    data = request.get_json() or {}
    items_data = data.get('items', [])
    if not items_data:
        return jsonify({'message': 'No items'}), 400

    if len(items_data) > 50:
        return jsonify({'message': 'Too many items in one order'}), 400

    subtotal = Decimal('0.00')
    prepared_items = []

    for item in items_data:
        try:
            product_id = int(item['product_id'])
            quantity = int(item['quantity'])
        except (KeyError, TypeError, ValueError):
            return jsonify({'message': 'Invalid order item payload'}), 400

        if quantity < 1:
            return jsonify({'message': 'Item quantity must be at least 1'}), 400

        product = Product.query.get(product_id)
        if not product or product.stock < quantity:
            db.session.rollback()
            return jsonify({'message': f'Insufficient stock for product {product_id}'}), 400

        unit_price = Decimal(str(product.price)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        subtotal += unit_price * quantity
        prepared_items.append({
            'product': product,
            'product_id': product_id,
            'quantity': quantity,
            'unit_price': unit_price,
            'customizations': item.get('customizations') if isinstance(item.get('customizations'), dict) else None,
        })

    shipping_fee = Decimal('0.00') if subtotal > Decimal('500.00') else Decimal('49.00')
    server_total = (subtotal + shipping_fee).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    order = Order(
        user_id=current_user_id(),
        total_price=server_total,
        shipping_info=data.get('shipping_info', {})
    )
    db.session.add(order)
    db.session.flush()

    for item in prepared_items:
        product = item['product']
        product.stock -= item['quantity']
        oi = OrderItem(
            order_id=order.id,
            product_id=item['product_id'],
            quantity=item['quantity'],
            unit_price=item['unit_price'],
            product_title=product.title,
            product_image=product.image_url,
            customizations=item['customizations'],
        )
        db.session.add(oi)

    db.session.commit()
    return jsonify(order.to_dict()), 201


@orders_bp.get('/orders')
@jwt_required()
def get_orders():
    if current_user_role() == 'admin':
        orders = Order.query.order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter_by(user_id=current_user_id()).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@orders_bp.put('/orders/<int:oid>/status')
@jwt_required()
def update_status(oid):
    if current_user_role() != 'admin':
        return jsonify({'message': 'Admin only'}), 403
    order = Order.query.get_or_404(oid)
    data = request.get_json()
    allowed = ('pending', 'shipped', 'delivered', 'cancelled')
    if data.get('status') not in allowed:
        return jsonify({'message': 'Invalid status'}), 400
    order.status = data['status']
    db.session.commit()
    return jsonify(order.to_dict())

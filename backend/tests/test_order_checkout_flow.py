import os
import unittest
from unittest.mock import patch

from app import app
from models.models import db


class OrderCheckoutFlowTest(unittest.TestCase):
    def setUp(self):
        self.previous_database_url = os.environ.get('DATABASE_URL')
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.client = app.test_client()

        with app.app_context():
            db.drop_all()
            db.create_all()

        self.admin = self._register('Admin', 'admin@hokinterior.com', 'Admin1234')
        self.customer = self._register('Customer', 'customer@example.com', 'Customer123')

        self.product_id = self._create_product(self.admin['token'])

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
        if self.previous_database_url is None:
            os.environ.pop('DATABASE_URL', None)
        else:
            os.environ['DATABASE_URL'] = self.previous_database_url

    def _register(self, name, email, password):
        response = self.client.post('/api/register', json={
            'name': name,
            'email': email,
            'password': password,
        })
        self.assertEqual(response.status_code, 201)
        return response.get_json()

    def _create_product(self, admin_token):
        response = self.client.post(
            '/api/products',
            headers={'Authorization': f'Bearer {admin_token}'},
            json={
                'title': 'Test Chair',
                'description': 'Comfortable chair',
                'price': 100,
                'image_url': 'https://example.com/chair.jpg',
                'stock': 10,
                'category': 'seating',
            },
        )
        self.assertEqual(response.status_code, 201)
        return response.get_json()['id']

    def test_checkout_sends_email_and_admin_can_see_order(self):
        with patch('routes.orders.send_order_confirmation_email') as send_order_confirmation_email:
            create_response = self.client.post(
                '/api/orders',
                headers={'Authorization': f"Bearer {self.customer['token']}"},
                json={
                    'items': [{'product_id': self.product_id, 'quantity': 2}],
                    'shipping_info': {
                        'first_name': 'Jane',
                        'last_name': 'Doe',
                        'email': 'customer@example.com',
                        'address': '123 Main Street',
                        'city': 'Nairobi',
                        'country': 'Kenya',
                    },
                    'total_price': 249,
                },
            )

        self.assertEqual(create_response.status_code, 201)
        order_payload = create_response.get_json()
        self.assertEqual(order_payload['status'], 'pending')
        self.assertEqual(len(order_payload['items']), 1)

        send_order_confirmation_email.assert_called_once()
        call_kwargs = send_order_confirmation_email.call_args.kwargs
        self.assertEqual(call_kwargs['to_email'], 'customer@example.com')
        self.assertEqual(call_kwargs['order_id'], order_payload['id'])

        admin_orders = self.client.get(
            '/api/orders',
            headers={'Authorization': f"Bearer {self.admin['token']}"},
        )
        self.assertEqual(admin_orders.status_code, 200)
        admin_orders_payload = admin_orders.get_json()
        self.assertEqual(len(admin_orders_payload), 1)
        self.assertEqual(admin_orders_payload[0]['id'], order_payload['id'])


if __name__ == '__main__':
    unittest.main()
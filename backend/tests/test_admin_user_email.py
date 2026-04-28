import os
import unittest
from unittest.mock import patch

from app import app
from models.models import db


class AdminUserEmailTest(unittest.TestCase):
    def setUp(self):
        self.previous_database_url = os.environ.get('DATABASE_URL')
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.drop_all()
            db.create_all()

        self.admin_token = self._register('Admin', 'admin@hokinterior.com', 'Admin1234')['token']
        self.user_one = self._register('First User', 'first@example.com', 'User12345')['user']
        self.user_two = self._register('Second User', 'second@example.com', 'User12345')['user']

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

    def test_admin_can_email_selected_users(self):
        with patch('routes.users.send_admin_message') as send_admin_message:
            response = self.client.post(
                '/api/users/email',
                headers={'Authorization': f'Bearer {self.admin_token}'},
                json={
                    'recipient_mode': 'selected',
                    'user_ids': [self.user_one['id']],
                    'subject': 'Shipping update',
                    'message': 'Your order is on the way.',
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['queued_count'], 1)
        send_admin_message.assert_called_once_with(
            'first@example.com',
            'First User',
            'Shipping update',
            'Your order is on the way.',
        )

    def test_admin_can_email_all_customers(self):
        with patch('routes.users.send_admin_message') as send_admin_message:
            response = self.client.post(
                '/api/users/email',
                headers={'Authorization': f'Bearer {self.admin_token}'},
                json={
                    'recipient_mode': 'all',
                    'subject': 'Store news',
                    'message': 'We have new arrivals this week.',
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['queued_count'], 2)
        self.assertEqual(send_admin_message.call_count, 2)

    def test_selected_mode_requires_users(self):
        response = self.client.post(
            '/api/users/email',
            headers={'Authorization': f'Bearer {self.admin_token}'},
            json={
                'recipient_mode': 'selected',
                'user_ids': [],
                'subject': 'Store news',
                'message': 'We have new arrivals this week.',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['message'], 'Select at least one user to email')


if __name__ == '__main__':
    unittest.main()
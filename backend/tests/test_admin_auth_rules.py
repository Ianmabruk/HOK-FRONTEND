import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
PYTHON = sys.executable


def run_backend_command(env, *args):
    return subprocess.run(
        [PYTHON, *args],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )


class AdminAuthRulesTest(unittest.TestCase):
    def test_only_configured_admin_email_receives_admin_role(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            env = os.environ.copy()
            env['DATABASE_URL'] = f"sqlite:///{Path(tmpdir) / 'admin-rules.db'}"
            env['ADMIN_EMAIL'] = 'admin@hokinterior.com'

            result = run_backend_command(
                env,
                '-c',
                textwrap.dedent(
                    '''
                    from app import app

                    with app.test_client() as client:
                        customer = client.post('/api/register', json={
                            'name': 'Customer User',
                            'email': 'customer@example.com',
                            'password': 'Customer123',
                        })
                        admin = client.post('/api/register', json={
                            'name': 'Admin User',
                            'email': 'admin@hokinterior.com',
                            'password': 'Admin1234',
                        })
                        print(customer.status_code, customer.json['user']['role'], customer.json['user']['email_verified'])
                        print(admin.status_code, admin.json['user']['role'], admin.json['user']['email_verified'])
                    '''
                ),
            )

            lines = result.stdout.strip().splitlines()
            self.assertEqual(lines[0], '201 customer False')
            self.assertEqual(lines[1], '201 admin True')

    def test_media_upload_uses_request_host_when_public_url_is_unset(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            env = os.environ.copy()
            env['DATABASE_URL'] = f"sqlite:///{Path(tmpdir) / 'media-upload.db'}"
            env['BACKEND_PUBLIC_URL'] = ''

            result = run_backend_command(
                env,
                '-c',
                textwrap.dedent(
                    '''
                    import io

                    from app import app

                    with app.test_client() as client:
                        client.post('/api/register', json={
                            'name': 'Admin User',
                            'email': 'admin@hokinterior.com',
                            'password': 'Admin1234',
                        })
                        login = client.post('/api/login', json={
                            'email': 'admin@hokinterior.com',
                            'password': 'Admin1234',
                        })
                        token = login.json['token']
                        response = client.post(
                            '/api/products/media-upload',
                            base_url='https://api.hokinterior.com',
                            headers={'Authorization': f'Bearer {token}'},
                            data={
                                'type': 'image',
                                'file': (io.BytesIO(b'fake-image-bytes'), 'chair.jpg'),
                            },
                            content_type='multipart/form-data',
                        )
                        print(response.status_code)
                        print(response.json['url'])
                    '''
                ),
            )

            lines = result.stdout.strip().splitlines()
            self.assertEqual(lines[0], '201')
            self.assertTrue(lines[1].startswith('https://api.hokinterior.com/uploads/images/'))


if __name__ == '__main__':
    unittest.main()
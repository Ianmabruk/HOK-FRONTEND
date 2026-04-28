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


class AdminSeedLoginTest(unittest.TestCase):
    def test_seed_admin_resets_credentials_and_login_succeeds(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            env = os.environ.copy()
            env['DATABASE_URL'] = f"sqlite:///{Path(tmpdir) / 'admin-login.db'}"

            first_seed = run_backend_command(env, 'seed_admin.py')
            self.assertIn('Admin created:', first_seed.stdout)

            break_password = run_backend_command(
                env,
                '-c',
                textwrap.dedent(
                    '''
                    from app import app
                    from models.models import User, db
                    import bcrypt

                    with app.app_context():
                        admin = User.query.filter_by(role='admin').first()
                        admin.password = bcrypt.hashpw(b'WrongPass123', bcrypt.gensalt()).decode()
                        db.session.commit()
                    '''
                ),
            )
            self.assertEqual(break_password.stdout.strip(), '')

            second_seed = run_backend_command(env, 'seed_admin.py')
            self.assertIn('Admin credentials updated:', second_seed.stdout)

            login_check = run_backend_command(
                env,
                '-c',
                textwrap.dedent(
                    '''
                    from app import app

                    with app.test_client() as client:
                        response = client.post('/api/login', json={
                            'email': 'admin@hokinterior.com',
                            'password': 'Admin@1234',
                        })
                        print(response.status_code)
                    '''
                ),
            )
            self.assertEqual(login_check.stdout.strip(), '200')


if __name__ == '__main__':
    unittest.main()
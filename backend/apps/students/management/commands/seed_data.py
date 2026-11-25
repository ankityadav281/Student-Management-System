from django.core.management.base import BaseCommand
from apps.students.views import SeedDemoDataView
from rest_framework.test import APIRequestFactory

class Command(BaseCommand):
    help = 'Seeds initial demonstration data into SQLite database.'

    def handle(self, *args, **options):
        factory = APIRequestFactory()
        request = factory.post('/api/students/seed-demo/')
        view = SeedDemoDataView.as_view()
        response = view(request)
        self.stdout.write(self.style.SUCCESS(response.data.get('message', 'Seeded successfully.')))

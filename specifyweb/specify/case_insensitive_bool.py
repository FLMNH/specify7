from django.db import models


class BooleanField(models.BooleanField):
    def to_python(self, value):
        if value == 'true':
            return True
        if value == 'false':
            return False
        return super(BooleanField, self).to_python(value)

class NullBooleanField(models.NullBooleanField):
    def to_python(self, value):
        if value == 'true':
            return True
        if value == 'false':
            return False
        return super(NullBooleanField, self).to_python(value)

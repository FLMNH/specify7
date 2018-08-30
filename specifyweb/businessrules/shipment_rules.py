from .orm_signal_handler import orm_signal_handler
from specifyweb.specify import models
from .exceptions import BusinessRuleException

@orm_signal_handler('pre_save', 'Shipment')
def shipped_to_agent_must_have_address(shipment):
    if shipment.shippedto is not None and \
           models.Address.objects.filter(agent=shipment.shippedto).count() < 1:
        raise BusinessRuleException("shippedto agent must have address")

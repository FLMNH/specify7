import logging
logger = logging.getLogger(__name__)

from .models import Spauditlog

class AuditLog(object):
    INSERT = 0
    UPDATE = 1
    REMOVE = 2

    def update(self, obj, agent, parent_record=None):
        return self._log(self.UPDATE, obj, agent, parent_record)

    def insert(self, obj, agent, parent_record=None):
        return self._log(self.INSERT, obj, agent, parent_record)

    def remove(self, obj, agent, parent_record=None):
        return self._log(self.REMOVE, obj, agent, parent_record)

    def _log(self, action, obj, agent, parent_record):
        logger.info("inserting into auditlog: %s", [action, obj, agent, parent_record])
        assert obj.id is not None, "attempt to add object with null id to audit log"
        return Spauditlog.objects.create(
            action=action,
            parentrecordid=parent_record and parent_record.id,
            parenttablenum=parent_record and parent_record.specify_model.tableId,
            recordid=obj.id,
            recordversion=obj.version,
            tablenum=obj.specify_model.tableId,
            createdbyagent=agent,
            modifiedbyagent=agent)


auditlog = AuditLog()

"use strict";

var $ = require('jquery');
var _ = require('underscore');


var api         = require('./specifyapi.js');
var UIPlugin    = require('./uiplugin.js');
var attachmentserverprivate = require('./attachments.js');
var attachmentserverpublic = require('./attachmentserverpublic.js');

module.exports =  UIPlugin.extend({
        __name__: "AttachmentsPlugin",
        events: {
            'change :file': 'fileSelected',
            'click .specify-attachment-display a': 'openOriginal'
        },
        render: function() {
            var self = this;
            if (!attachmentserverprivate) {
                self.$el.replaceWith('<div>Attachment server unavailable.</div>');
                return this;
            }
            var control = $('<div class="specify-attachment-container">');
            self.$el.replaceWith(control);
            self.setElement(control);

            if (self.model && self.model.get('attachment')) {
                self.model.rget('attachment', true).done(function(attachment) {
                    self.displayAttachment(attachment);
                });
            } else {
                self.addAttachment();
            }
            return this;
        },
        addAttachment: function() {
            this.$el.append('<form enctype="multipart/form-data"><input type="checkbox" id="isPublicImage">  Is this a public image file?<br><input type="file" name="file"></form>');
        },
        fileSelected: function(evt) {
            var files = this.$(':file').get(0).files;
            if (files.length === 0) return;

            var isPublicImage = this.$('#isPublicImage').get(0).checked;
            this.startUpload(files[0], isPublicImage);
        },
        startUpload: function(file, isPublicImage) {
            var self = this;

            self.progressBar = $('<div class="attachment-upload-progress">').progressbar();

            self.progressDialog = $('<div>', {title: 'Uploading'})
                .appendTo(self.el)
                .append(self.progressBar)
                .dialog({ modal:true });

            if (isPublicImage) { var attachmentserver = attachmentserverpublic;}
            else {var attachmentserver = attachmentserverprivate;}

            attachmentserver.uploadFile(file, function(progressEvt) {
                self.uploadProgress(progressEvt);
            }).done(function(attachment) {
                self.uploadComplete(attachment);
            });
        },
        uploadProgress: function (evt) {
            var self = this;
            if (evt.lengthComputable) {
                self.progressBar.progressbar('option', {
                    value: evt.loaded,
                    max: evt.total
                });
            } else {
                self.progressBar.progressbar('option', 'value', false);
            }
        },
        uploadComplete: function(attachment) {
            var self = this;
            self.trigger('uploadcomplete', attachment);
            self.model && self.model.set('attachment', attachment);
            self.displayAttachment(attachment);
            self.progressDialog.dialog('close');
        },
        displayAttachment: function(attachment) {
            var self = this;
            self.$el.empty().append('<div class="specify-attachment-display">');

            if (attachment.attributes.ispublic) { var attachmentserver = attachmentserverpublic;}
            else {var attachmentserver = attachmentserverprivate;}

            attachmentserver.getThumbnail(attachment).done(function(img) {
                $('<a>').append(img).appendTo(self.$('.specify-attachment-display'));
            });
        },
        openOriginal: function(evt) {
            evt.preventDefault();
            this.model.rget('attachment', true).done(function(attachment) {
                if (attachment.get('ispublic')) { var attachmentserver = attachmentserverpublic;}
                else {var attachmentserver = attachmentserverprivate;}
                attachmentserver.openOriginal(attachment);
            });
        }
    }, { pluginsProvided: ['AttachmentPlugin'] });

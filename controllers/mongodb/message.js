const Joi = require('joi');
const { Message } = require('../../models/message');
const { getAppByID } = require('./application');
const { getEventByID } = require('./event');
const { getNotificationTypeByID } = require('./notificationtype');
const { BadRequest, NotFound } = require('../../utils/error');

async function createMessage(req) {
  // first check if notification type is provided
  if (!req.notification_type)
    throw new BadRequest(
      '"notification_type" (notification type ID) is required',
    );

  // check if notification type exists and is active + not deleted
  const notif = await getNotificationTypeByID(req.notification_type);

  if (!notif)
    throw new NotFound(
      'The notification type with the given ID was not found.',
    );

  if (!notif.is_active) {
    throw new BadRequest('The notification type is inactive.');
  }

  // check if event exists and is active + not deleted
  const event = await getEventByID(notif.event);

  if (!event)
    throw new Error( // throwing error since this should not happen
      `Unknown event with ID: ${notif.event} found in notification type: ${notif.id}`,
    );

  if (!event.is_active)
    throw new BadRequest('The event for this notification type is inactive.');

  // check if application exists and is active + not deleted
  const app = await getAppByID(event.application);

  if (!app)
    throw new Error( // throwing error since this should not happen
      `Unknown application with ID: ${event.application} found. [event: ${event.id}, notification type: ${notif.id}]`,
    );

  if (!app.is_active)
    throw new BadRequest(
      'The application for this notification type is inactive.',
    );

  // fetch template from notification type and
  // replace placeholders with metadata
  const { email, metadata } = req;
  let body = notif.template_body;

  if (notif.tags) {
    const metadataSchema = Joi.object().keys({
      ...notif.tags.reduce((accumulator, tag) => {
        accumulator[tag] = Joi.any().required();
        return accumulator;
      }, {}),
    });

    const { error } = metadataSchema.validate(metadata);

    if (error)
      throw new BadRequest(`${error.details[0].message} in metadata object`);

    Object.keys(metadata).forEach((key) => {
      body = body.replace(`{{${key}}}`, metadata[key]);
    });
  }

  const message = new Message({
    subject: notif.template_subject,
    body,
    email,
    notification_type: notif.id,
  });

  return message.save();
}

module.exports = {
  createMessage,
};

import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export const mailer = {
  // IMPORTANT: For this to work perfectly, your EmailJS "Contact Us" template must have:
  // - "To Email" set to: {{to_email}}
  // - The message body mapping the {{message}} variable.
  // - The subject set to: {{subject}}
  sendEmail: async (to_email, to_name, subject, message) => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error("EmailJS not configured. Check .env variables.");
      return;
    }

    try {
      const templateParams = {
        to_email,
        to_name,
        subject,
        message,
        reply_to: 'karankharvar2004@gmail.com',
        name: 'Voggue7', // Provides value for {{name}} in default template
        email: 'karankharvar2004@gmail.com', // Provides value for {{email}} in default template
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log(`Email sent to ${to_email} successfully.`);
    } catch (e) {
      console.error("Failed to send email via EmailJS:", e);
    }
  },

  sendOrderConfirmed: async (order) => {
    if (!order.userEmail) return;
    const subject = `Order Confirmed: #${order.id.slice(0, 8).toUpperCase()}`;
    const message = `Hi ${order.userName}, we've successfully received your Voggue7 order! Order Total: ₹${order.total}. We will prepare your items and notify you once they ship!`;
    await mailer.sendEmail(order.userEmail, order.userName, subject, message);
  },

  sendOrderStatusUpdate: async (order, newStatus) => {
    if (!order.userEmail) return;
    const subject = `Order Update: #${order.id.slice(0, 8).toUpperCase()} - ${newStatus.toUpperCase()}`;
    let message = `Hi ${order.userName}, your Voggue7 order status has been updated to: ${newStatus.toUpperCase()}.`;
    
    if (newStatus === "shipped") {
      message = `Hi ${order.userName}, great news! Your order has shipped.` + (order.trackingId ? ` Tracking ID: ${order.trackingId}` : "");
    } else if (newStatus === "delivered") {
      message = `Hi ${order.userName}, your order has been delivered! We hope you love your new styles.`;
    } else if (newStatus === "cancelled") {
      message = `Hi ${order.userName}, your order has been cancelled. If you paid online, expect a refund in 5-7 business days.`;
    }

    await mailer.sendEmail(order.userEmail, order.userName, subject, message);
  }
};

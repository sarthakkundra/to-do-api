const sgMail = require('@sendgrid/mail');

const sendgridAPIkey = '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';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendWelcomeMail = (email, name) =>{

      const msg = {
        to: email,
        from: 'sarthakkundra21@gmail.com',
        subject: 'Welcome Email',
        text: `Thanks ${name} for registering for the to-do app. Hope you have fun`
      };
      
      sgMail
          .send(msg)
          .then(() => {}, error => {
            console.error(error);
        
            if (error.response) {
              console.error(error.response.body)
            }
      });

}

const sendCancellationMail = (email, name) =>{

  const msg = {
    to: email,
    from: 'sarthakkundra21@gmail.com',
    subject: 'Account cancelled successfully',
    text: 'Sad to see you go. We would love to hear suggestions from you to better our services'
  };
  
  sgMail
      .send(msg)
      .then(() => {}, error => {
        console.error(error);
     
        if (error.response) {
          console.error(error.response.body)
        }
  });
}

module.exports = {
  sendWelcomeMail,
  sendCancellationMail
}
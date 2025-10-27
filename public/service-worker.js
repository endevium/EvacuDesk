self.addEventListener('push', event => {
  let data = { title: 'Notification', body: 'You have a new notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Notification', body: event.data.text() };
    }
  }

  const title = data.title;
  const options = {
    body: data.body,
    icon: 'vite.svg' 
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

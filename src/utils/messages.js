const generateMessageObj = (username, message) => ({
  username,
  text: message,
  createdAt: new Date().getTime()
});

const generateLocationMessageObj = (username, url) => ({
  username,
  url,
  createdAt: new Date().getTime()
});

export { generateMessageObj, generateLocationMessageObj };


const interaction = async function(req, state) {
  const payload = req.body.payload;
  console.log(JSON.parse(payload));
  return "W00t"
}

module.exports = {
  interaction
}

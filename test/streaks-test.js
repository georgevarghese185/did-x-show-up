const stats = require('../src/stats');

const testEntries = [
  {showed_up: "NO"},
	{showed_up: "EXCUSE"},
	{showed_up: "NO"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "EXCUSE"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "EXCUSE"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "EXCUSE"},
	{showed_up: "EXCUSE"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "EXCUSE"},
	{showed_up: "NO"},
	{showed_up: "EXCUSE"},
	{showed_up: "EXCUSE"},
	{showed_up: "EXCUSE"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "EXCUSE"},
	{showed_up: "YES"},
	{showed_up: "NO"},
	{showed_up: "EXCUSE"},
	{showed_up: "NO"},
	{showed_up: "NO"},
	{showed_up: "EXCUSE"},
	{showed_up: "EXCUSE"},
	{showed_up: "YES"},
	{showed_up: "YES"},
	{showed_up: "EXCUSE"},
	{showed_up: "YES"},
	{showed_up: "EXCUSE"},
	{showed_up: "EXCUSE"},
	{showed_up: "YES"}
]



const run = async function() {
  let sent = false;
  const getNextBatch = async function() {
    if(!sent) {
      sent = true;
      return testEntries;
    } else {
      return [];
    }
  }

  const streaks = await stats.getStreaks(getNextBatch)
  return streaks;
}

run().then(console.log).catch(console.error);


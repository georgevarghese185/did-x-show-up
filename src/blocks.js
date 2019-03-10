const showUpQuestionBlock = function(x) {
  return [
  	{
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": `Did ${x} show up to work today?`
  		}
  	},
  	{
      "block_id": "showed_up",
  		"type": "actions",
  		"elements": [
  			{
  				"type": "button",
  				"text": {
  					"type": "plain_text",
  					"text": "Yes"
  				},
  				"action_id": "x_show"
  			},
  			{
  				"type": "button",
  				"text": {
  					"type": "plain_text",
  					"text": "No"
  				},
  				"action_id": "x_no_show"
  			},
        {
  				"type": "button",
  				"text": {
  					"type": "plain_text",
  					"text": "Excused"
  				},
  				"action_id": "x_excuse"
  			}
  		]
  	}
  ]
}

const showUpResponseBlock = function(x, action, stats) {
  let text;

  if(action == "x_show") {
    text = `*Yay! ${x} showed up! :smile:*`;
  } else if(action == "x_no_show") {
    text = `*${x} didn't show up :white_frowning_face:*`;
  } else {
    text = `*${x} is excused for today :upside_down_face:*`
  }

  return [
  	{
  		"type": "divider"
  	},
  	{
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": text
  		}
  	},
    {
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": `

_${x}'s current streak_: *${stats.currentStreak}*
_${x}'s longest streak_: *${stats.longestStreak}*
_${x} showed up_ *${stats.showUpCount.thisWeek}* _times this week_
_${x} showed up_ *${stats.showUpCount.last30Days}* _times in the last 30 days_
_${x}'s show-up-rate this year so far is_ *${stats.yearShowUpRate}*%`
  		}
  	}
  ]
}

module.exports = {
  showUpQuestionBlock,
  showUpResponseBlock
}

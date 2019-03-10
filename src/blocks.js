const showUpQuestionBlock = function(x_id) {
  return [
  	{
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": `Did <@${x_id}> show up to work today?`
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

const showUpResponseBlock = function(x_id, action, stats) {
  let text;

  if(action == "x_show") {
    text = `*Yay! <@${x_id}> showed up! :smile:*`;
  } else if(action == "x_no_show") {
    text = `*<@${x_id}> didn't show up :white_frowning_face:*`;
  } else {
    text = `*<@${x_id}> is excused for today :upside_down_face:*`
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

_<@${x_id}>'s current streak_: *${stats.currentStreak}*
_<@${x_id}>'s longest streak_: *${stats.longestStreak}*
_<@${x_id}> showed up_ *${stats.showUpCount.thisWeek}* _times this week_
_<@${x_id}> showed up_ *${stats.showUpCount.last30Days}* _times in the last 30 days_
_<@${x_id}>'s show-up-rate this year so far is_ *${stats.yearShowUpRate}*%`
  		}
  	}
  ]
}

module.exports = {
  showUpQuestionBlock,
  showUpResponseBlock
}

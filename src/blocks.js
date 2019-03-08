const showUpQuestionBlock = function(X) {
  return [
  	{
  		"type": "section",
  		"text": {
  			"type": "plain_text",
  			"text": `Did ${X} show up to work today?`
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
  			}
  		]
  	}
  ]
}

const showUpResponseBlock = function(X) {
  return [
  	{
  		"type": "divider"
  	},
  	{
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": `*Yay! ${X} showed up! :smile:*`
  		}
  	},
      {
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": `*${X} didn't show up :white_frowning_face:*`
  		}
  	},
  	{
  		"type": "section",
  		"text": {
  			"type": "mrkdwn",
  			"text": `\n\n_${X}'s current streak_: *N*\n_${X}'s longest streak_: *N*\n_${X} showed up_ *N* _times this week_\n_${X} showed up_ *N* _times in the last 30 days_\n_${X}'s show-up-rate this year so far is_ *N*%`
  		}
  	}
  ]
}

module.exports = {
  showUpQuestionBlock,
  showUpResponseBlock
}

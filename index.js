// From Joel Grus Plyglot Twitter Bot blog post series
// http://joelgrus.com/2015/12/29/polyglot-twitter-bot-part-2-nodejs-aws-lambda/

var Twitter = require('twitter');

/**
 * credentials.js should look like
 *
 * module.exports = {
 *   consumer_key: "...",
 *   consumer_secret: "...",
 *   access_token_key: "...",
 *   access_token_secret: "..."
 * };
 */

var credentials = require('./credentials');
var client = new Twitter(credentials);

/**
 * We want to find tweets that look like "make ____ great again"
 * We can get most of the way there using the following Twitter query,
 * and then we'll use a regex to filter out the false positives.
 */
 
var query = 'Oscars2016 -filter:retweets';
var rgx = /Oscars2016/i;

// Runs a Twitter search for the specified `query` and retweets all the results.
function searchAndTweet(succeed, fail) {
  console.log("search and tweet");
  client.get('search/tweets', {q: query, count: 15}, function(err, tweets, response) {
    if (!tweets.statuses) {
      fail(err);
    }

    console.log(new Date());
    console.log('found ' + tweets.statuses.length + ' tweets');

    tweets.statuses.forEach(function(tweet) {
      // Make sure we match the regex.
      var match = tweet.text.match(rgx);
      if (match) {
        var tweetId = tweet.id_str;
        client.post('statuses/retweet/' + tweetId, function(err, tweet, id) {
          // Will return an error if we try to retweet a tweet that we've already
          // retweeted.
          console.log(err || tweet.text);
        });
      } else {
        // do something for no match
      }
    });
    succeed("success");
  });
}

exports.handler = function(event, context) {
  console.log("inside handler");
  searchAndTweet(context.succeed, context.fail);
}
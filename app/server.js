import {readDocument, writeDocument, addDocument} from './database.js';

/**
 * Emulates how a REST call is *asynchronous* -- it calls your function back
 * some time in the future with data.
 */
function emulateServerReturn(data, cb) {
  setTimeout(() => {
    cb(data);
  }, 4);
}

function getFeedItemSync(feedItemId) {
  var feedItem = readDocument('feedItems', feedItemId);
  // Resolve 'like' counter.
  feedItem.likeCounter =
    feedItem.likeCounter.map((id) => readDocument('users', id));
  // Assuming a StatusUpdate. If we had other types of
  // FeedItems in the DB, we would
  // need to check the type and have logic for each type.
  feedItem.contents.author =
    readDocument('users', feedItem.contents.author);
  // Resolve comment author.
  feedItem.comments.forEach((comment) => {
    comment.author = readDocument('users', comment.author);
  });
  return feedItem;
}

export function getFeedData(user, cb) {
  // Get the User object with the id "user".
  var userData = readDocument('users', user);
  // Get the Feed object for the user.
  var feedData = readDocument('feeds', userData.feed);
  // Map the Feed's FeedItem references to actual FeedItem objects.
  // Note: While map takes a callback function as an argument, it is
  // synchronous, not asynchronous. It calls the callback immediately.
  feedData.contents = feedData.contents.map(getFeedItemSync);
  // Return FeedData with resolved references.
  // emulateServerReturn will emulate an asynchronous server operation, which
  // invokes (calls) the "cb" function some time in the future.
  emulateServerReturn(feedData, cb);
}


export function postStatusUpdate(user, location, contents, cb) {
  // If we were implementing this for real on an actual server, we would check
  // that the user ID is correct & matches the authenticated user. But since
  // we're mocking it, we can be less strict.

  // Get the current UNIX time.
  var time = new Date().getTime();
  var userData = readDocument('users', user); //get the user?
  var feedData = readDocument('feeds', userData.feed); //get the user's feed
  // The new status update. The database will assign the ID for us.
  var newStatusUpdate = {
    "_id": feedData.contents.length,
    "likeCounter": [],
    "type": "statusUpdate",
    "contents": {
      "author": user,
      "postDate": time,
      "location": location,
      "contents": contents
    },
    // List of comments on the post
    "comments": []
  };

  // Add the status update to the database.
  // Returns the status update w/ an ID assigned.
  newStatusUpdate = addDocument('feedItems', newStatusUpdate);

  // Add the status update reference to the front of the current user's feed.

  feedData.contents.unshift(newStatusUpdate._id);

  // Update the feed object.
  writeDocument('feeds', feedData);//rewrite the contents?

  // Return the newly-posted object.
  emulateServerReturn(newStatusUpdate, cb);
}




export function postComment(feedItemId, author, contents, cb) {
  // Since a CommentThread is embedded in a FeedItem object,
  // we don't have to resolve it. Read the document,
  // update the embedded object, and then update the
  // document in the database.
  var feedItem = readDocument('feedItems', feedItemId);
  console.log("comments length:" + feedItem.comments.length);
  var newComment ={
    "_id": feedItem.comments.length+1, //needed to make sure that new commments have an id
    "author": author,
    "contents": contents,
    "postDate": new Date().getTime(),
    "likeCounter": [] //ADDED FOR WORKSHOP 8 STEP 8
  };

  feedItem.comments.push(newComment);


  writeDocument('feedItems', feedItem);
  // Return a resolved version of the feed item so React can
  // render it.
  emulateServerReturn(getFeedItemSync(feedItemId), cb);
}


/**
 * Updates a feed item's likeCounter by adding the user to the likeCounter.
 * Provides an updated likeCounter in the response.
 */
export function likeFeedItem(feedItemId, userId, cb) {
  var feedItem = readDocument('feedItems', feedItemId);
  // Normally, we would check if the user already liked this comment.
  // But we will not do that in this mock server.
  // ('push' modifies the array by adding userId to the end)
  feedItem.likeCounter.push(userId);
  writeDocument('feedItems', feedItem);
  // Return a resolved version of the likeCounter
  emulateServerReturn(feedItem.likeCounter.map((userId) => readDocument('users', userId)), cb);
}

/**
 * Updates a feed item's likeCounter by removing the user from the likeCounter.
 * Provides an updated likeCounter in the response.
 */
export function unlikeFeedItem(feedItemId, userId, cb) {
  var feedItem = readDocument('feedItems', feedItemId);
  // Find the array index that contains the user's ID.
  // (We didn't *resolve* the FeedItem object, so it is just an array of user IDs)
  var userIndex = feedItem.likeCounter.indexOf(userId);
  // -1 means the user is *not* in the likeCounter, so we can simply avoid updating
  // anything if that is the case: the user already doesn't like the item.
  if (userIndex !== -1) {
    // 'splice' removes items from an array. This removes 1 element starting from userIndex.
    feedItem.likeCounter.splice(userIndex, 1);
    writeDocument('feedItems', feedItem);
  }
  // Return a resolved version of the likeCounter
  emulateServerReturn(feedItem.likeCounter.map((userId) => readDocument('users', userId)), cb);
}








/**
 * Adds a 'like' to a comment.
 */

export function likeComment(feedItemId, index, userId, cb) {
  var feedItem = readDocument('feedItems', feedItemId); //get feed item
  //console.log("feed item id is:" + feedItemId);                                 //debug (ID is correct)
  //console.log("feed item (should be an object) is:" );                //debug (returning empty object?)
  //console.log(feedItem);
  //console.log("index is" + index);
  var commentItem = feedItem.comments[index]; //get the specific item THIS ISN"T WORKING CORECTLY

  //console.log("specific comment  object is: ")
//  console.log(commentItem);                             //DEBUG
  commentItem.likeCounter.push(userId); //push changes to the comment
  feedItem.comments[index] =  commentItem; //this needed? or are we just doing a reference to the item? NOT SURE ABOUT

  writeDocument('feedItems', feedItem);  // Return a resolved version of the likeCounter
  //feedItem.likeCounter.map((userId) => readDocument('users', userId))
  emulateServerReturn(commentItem, cb);
}


export function unlikeComment(feedItemId, index, userId, cb) {
  var feedItem = readDocument('feedItems', feedItemId);
  var commentItem = feedItem.comments[index]; //get the comment at the index specified (NOT WORKING)
  var userIndex = commentItem.likeCounter.indexOf(userId); //get if user is in list and if so at what index
  if (userIndex !== -1) {
    commentItem.likeCounter.splice(userIndex, 1); //get rid of the user from like list for a comment
    writeDocument('feedItems', feedItem); //write the item back
  }

  emulateServerReturn(commentItem, cb);
}

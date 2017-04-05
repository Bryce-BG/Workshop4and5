import React from 'react';
import {unixTimeToString} from '../util';
import {Link} from 'react-router';
import {unlikeComment, likeComment} from '../server';
export default class Comment extends React.Component {

  constructor(props) {
      super(props);


      this.state = props.data;
      //console.log("COMMENT STATE:");
      //console.log(this.state);
    }



    didUserLike() {
     return this.state.likeCounter.indexOf(4) !== -1;
   }


  handleLikeClick(e) {
    e.preventDefault();
    //e.target.value //the vlaue that is in the target (button or click) that triggered the event
    if (e.button === 0) {
      var callbackFunction = (updatedLikeCounter) => {
        //console.log(updatedLikeCounter);
        //console.log(updatedLikeCounter.likeCounter);
        //console.log(updatedLikeCounter._id);
        this.setState({likeCounter: updatedLikeCounter.likeCounter});
        //console.log(this);
        //console.log(this.state.likeCounter);
        //console.log("state changed");
      };

        if (this.didUserLike()) {
          // User clicked 'unlike' button.
          //console.log("feed item ID:" + this.props.feedItemId -1);                      //debug
          unlikeComment(this.props.feedItemId, this.state._id -1, 4, callbackFunction);
        } else {
          // User clicked 'like' button.
          //console.log("commment item id is:" + this.state._id );                      //debug
          likeComment(this.props.feedItemId, this.state._id -1, 4, callbackFunction);
        }
    }

  }


  render() {
    var likeButtonText = "Like";
    if (this.didUserLike()) {
          likeButtonText = "Unlike";
        }


    return (
      <div>
        <div className="media-left media-top">
          PIC
        </div>
        <div className="media-body">
        <Link to={"/profile/" + this.props.author._id}>{this.props.author.fullName}</Link> {this.props.children}
          <br />

          <a href="#" onClick={(e) => this.handleLikeClick(e)}> {likeButtonText} {this.state.likeCounter.length} </a> {/*second item is for counting*/}

          <a href="#">Reply</a>
            {unixTimeToString(this.props.postDate)}
        </div>
      </div>
    )
  }
}

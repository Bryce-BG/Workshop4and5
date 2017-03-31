import React from 'react';
import {unixTimeToString} from '../util';
import {Link} from 'react-router';
import {unlikeComment, likeComment} from '../server';
export default class Comment extends React.Component {

  constructor(props) {
      super(props);
      console.log('comment props', this.props); //debug statement
      console.log('state of comment is: ', this.props.data); //debug statement

      this.state = props.data;
        console.log('key is', this.state._id);//debug statement
    }



    didUserLike() {
     return this.props.likeCounter.indexOf(4) !== -1;
   }



  handleLikeClick(e) {
    e.preventDefault();
    //e.target.value //the vlaue that is in the target (button or click) that triggered the event
    if (e.button === 0) {
      var callbackFunction = (updatedLikeCounter) =>
      {
      this.setState({likeCounter: updatedLikeCounter});

      };
        if (this.didUserLike()) {
          // User clicked 'unlike' button.
          unlikeComment(this.state.key, 4, callbackFunction);
        } else {
          // User clicked 'like' button.

          likeComment(this.props.feedItemID, this.state._id, 4, callbackFunction);
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

          <a href="#" onClick={(e) => this.handleLikeClick(e)}> {likeButtonText} {this.props.likeCounter.length} </a> {/*second is just so we can keep track of like changes*/}

          <a href="#">Reply</a>
            {unixTimeToString(this.props.postDate)}
        </div>
      </div>
    )
  }
}

/**
 * Holds all the models that are specific to this harvester.
 * These are generally things like mappings, which convert source data into the refinery message schema
 */

module.exports = {};
var baseUrl = "https://jsonplaceholder.typicode.com"
module.exports.queryTransforms = [
  {
    desc: "Pulling Posts",
    url: baseUrl + '/posts',
    transform: (itm) => {
      return {
        "Name": itm.title,
        "NodeType":"Post",
        "Priority": 1,
        "ConformedDimensions": {
          "Id": itm.id
        },
        "Properties": {
          "Body": itm.body
        },
        "Connections": [
          {
            "NodeType": "User",
            "RelType": "PostedByUser",
            "ForwardRel": true,
            "ConformedDimensions": {
              "Id": itm.userId
            }
          }
        ]
      }
    }
  },
  {
    desc: "Pulling Users",
    url: baseUrl + '/users',
    transform: (itm) => {
      return {
        "Name": itm.name,
        "NodeType":"User",
        "Priority": 1,
        "ConformedDimensions": {
          "Id": itm.id
        },
        "Properties": {
          "Username":itm.username,
          "Phone":itm.phone,
          "Website":itm.website,
          "Company":itm.company.name,
        },
      }
    }
  },
  {
    desc: "Pulling Comments",
    url: baseUrl + '/comments',
    transform: (itm) => {
      return {
        "Name": itm.name,
        "NodeType":"Comment",
        "Priority": 1,
        "ConformedDimensions": {
          "Id": itm.id
        },
        "Properties": {
          "Body": itm.body,
          "Email": itm.email
        },
        "Connections": [
          {
            "NodeType": "Post",
            "RelType": "CommentOnPost",
            "ForwardRel": true,
            "ConformedDimensions": {
              "Id": itm.postId
            }
          }
        ]
      }
    }
  },
  {
    desc: "Pulling Albums",
    url: baseUrl + '/albums',
    transform: (itm) => {
      return {
        "Name": itm.title,
        "NodeType":"Album",
        "Priority": 1,
        "ConformedDimensions": {
          "Id": itm.id
        },
        "Connections": [
          {
            "NodeType": "User",
            "RelType": "AlbumByUser",
            "ForwardRel": true,
            "ConformedDimensions": {
              "Id": itm.userId
            }
          }
        ]
      }
    }
  },
  {
    desc: "Pulling Photos",
    url: baseUrl + '/photos',
    transform: (itm) => {
      return {
        "Name": itm.title,
        "NodeType":"Photo",
        "Priority": 1,
        "ConformedDimensions": {
          "Id": itm.id
        },
        "Properties": {
          "Url": itm.url,
          "ThumbnailUrl": itm.thumbnailUrl
        },
        "Connections": [
          {
            "NodeType": "Album",
            "RelType": "PhotoInAlbum",
            "ForwardRel": true,
            "ConformedDimensions": {
              "Id": itm.albumId
            }
          }
        ]
      }
    }
  },
  {
    desc: "Pulling Todos",
    url: baseUrl + '/todos',
    transform: (itm) => {
      return {
        "Name": itm.title,
        "NodeType": "Todo",
        "Priority": 1,
        "ConformedDimensions": {
          "Id": itm.id
        },
        "Properties": {
          "Completed": itm.completed,
        },
        "Connections": [
          {
            "NodeType": "User",
            "RelType": "TodoByUser",
            "ForwardRel": true,
            "ConformedDimensions": {
              "Id": itm.userId
            }
          }
        ]
      }
    }
  }, 
]

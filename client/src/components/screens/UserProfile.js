import React,{useEffect, useState, useContext} from 'react';
import {UserContext} from '../../App'
import {useParams} from 'react-router-dom'

const Profile = () => {

    const [userProfile, setuserProfile] = useState(null)
    const {state, dispatch} = useContext(UserContext)
    const { userid } = useParams()
    // const [showfollow, setShowFollow] = useState(true)
    
    const [showfollow, setShowFollow] = useState(state ? !state.following.includes(userid) : true)



    useEffect(() => {

        fetch(`/user/${userid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
        .then(result => {
            // console.log(result)
            setuserProfile(result)
        })

    },[]) //by putting [] means adding empty dependecies



    const followUser = () => {
        fetch('/follow', {
            method: "put", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                followId: userid
            })
        })
        .then(res => res.json())

        .then(data => {

            dispatch({type: "UPDATE", payload: {

                following: data.following,
                followers: data.followers
            
            }})
            localStorage.setItem("user", JSON.stringify(data))
            setuserProfile((prevState) => {
                return {
                    ...prevState,
                    user: {
                        ...prevState.user,
                        followers: [...prevState.user.followers,
                                    data._id
                                    ]
                        }
                }
            })
            setShowFollow(false)
            console.log(data)
        })
    }


    
    const unfollowUser = () => {
        fetch('/unfollow', {
            method: "put", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                unfollowId: userid
            })
        })
        .then(res => res.json())

        .then(data => {

            dispatch({type: "UPDATE", payload: {

                following: data.following,
                followers: data.followers
            
            }})
            localStorage.setItem("user", JSON.stringify(data))
            setuserProfile((prevState) => {
                const newFollower = prevState.user.followers.filter(item => item != data._id)
                return {
                    ...prevState,
                    user: {
                        ...prevState.user,
                        followers:newFollower
                        }
                }
            })
            setShowFollow(true)
            console.log(data)
        })
    }




    return  (
        <>
        {userProfile 
        
        ?  
        
        <div style={{maxWidth: "550px", margin: "0px auto"}}>
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                margin: "18px 0px",
                borderBottom: "1px solid grey"
            }}>
                <div>
                    <img 
                        style={{width: "160px", height: "160px", borderRadius: "80px"}}
                        //src="https://images.unsplash.com/photo-1595399874399-10f2444c4eb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
                        src={userProfile.user.pic}
                    />
                </div>
                <div>
                    <h4>{userProfile.user.name}</h4>
                    <h5>{userProfile.user.email}</h5>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "108%"
                    }}>

                        <h6>{userProfile.posts.length}</h6>
                        <h6>{userProfile.user.followers.length} followers</h6>
                        <h6>{userProfile.user.following.length} following</h6>

                    </div>
                    
                    {
                    
                    showfollow 
                    
                    ?

                    <button style={{margin: "10px"}}
                    className="btn waves-effect waves-light #64b5f6 blue lighten-2"
                    name="action"
                    onClick={() => followUser()}
                    >
                        Follow
                    </button>

                    :

                    <button style={{margin: "10px"}}
                    className="btn waves-effect waves-light #64b5f6 blue lighten-2"
                    name="action"
                    onClick={() => unfollowUser()}
                    >
                        unFollow
                    </button>

                    }


                </div>
            </div>
        
            <div className="gallery">

                {
                    userProfile.posts.map(item => {
                        return(
                            <img key={item._id} className="item" src={item.photo} alt={item.title} />
                        )
                    })
                }

            </div>
        </div>
        
        : 
        
        <h2>loading...!</h2>}
      
        </>
        
    )

}

export default Profile;
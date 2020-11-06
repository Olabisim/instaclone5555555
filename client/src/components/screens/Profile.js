import React,{useEffect, useState, useContext} from 'react';
import {UserContext} from '../../App'

const Profile = () => {

    const [mypics, setPics] = useState([])
    const {state, dispatch} = useContext(UserContext)
    const [image, setImage] = useState("")


    useEffect(() => {

        fetch('/mypost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
        .then(result => {
            setPics(result.mypost)
        })

    },[]) //by putting [] means adding empty dependecies


    useEffect(() => {
        if(image) {
            
            const data = new FormData()

            data.append("file", image)
            data.append("upload_preset", "insta-clone")
            data.append("cloud_name", "olabisiminasu")

            fetch("https://api.cloudinary.com/v1_1/olabisiminasu/image/upload", {
                method: "post",
                body: data
            })
            .then(res => res.json())
            .then(data => {
                fetch("/updatepic", {
                    method: "put",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("jwt")
                    },
                    body: JSON.stringify({
                        pic: data.url
                    })
                }).then(res => res.json())

                .then( result => {
                    console.log(result)
                    localStorage.setItem("user", JSON.stringify({...state,pic:result.pic}))
                    dispatch({type: "UPDATEPIC", payload: result.pic})
                })
            })
            .catch( err => {
                console.log(err)
            })
        }

    }, [image])
    const updatePhoto = (file) => {
        
        setImage(file)
    }


    return  (
        <div style={{maxWidth: "550px", margin: "0px auto"}}>

            <div style={{
                    margin: "18px 0px",
                    borderBottom: "1px solid grey"
            }}>
                
                <div style={{
                        display: "flex",
                        justifyContent: "space-around",
                }}>
                    <div>


                        <img 
                            style={{width: "160px", height: "160px", borderRadius: "80px"}}
                            //src="https://images.unsplash.com/photo-1595399874399-10f2444c4eb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
                            src={state ? state.pic : 'loading'}
                        />
                        


                    
                        {/* <div className="file-field input-field">

                            <div className="btn #64b5f6 blue darken-1">
                                <span>Upload pic</span>
                                <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                            </div>

                            <div className="file-path-wrapper">
                                <input className="file-path validate" type="text" />
                            </div>

                        </div> */}


                    </div>


                    <div>
                        <h4>{state ? state.name: "loading"}</h4>
                        <h5>{state ? state.email: "loading"}</h5>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "108%"
                        }}>

                            <h6>{mypics.length} posts</h6>
                            <h6>{state ? state.followers.length : "0"} followers</h6>
                            <h6>{state ? state.following.length : "0"} following</h6>

                        </div>
                    </div>
                </div>
            
                {/* <button style={{margin: '10px'}}
                            className="btn waves-effect waves-light #64b5f6 blue darken-2" name="action"
                            style= {{margin: "10px 0px 10px 50px"}}
                            onClick= {() => {
                                updatePhoto()
                            }}
                        >
                            
                        update profile pic
                </button> */}

                
                <div className="file-field input-field" style={{margin: "10px"}}>

                    <div className="btn #64b5f6 blue darken-1">
                        <span>Update pic</span>
                        <input type="file" onChange={(e) => updatePhoto(e.target.files[0])} />
                    </div>

                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" />
                    </div>

                </div>
            
            </div>

            <div className="gallery">

                {
                    mypics.map(item => {
                        return(
                            <img key={item._id} className="item" src={item.photo} alt={item.title} />
                        )
                    })
                }

            </div>
        </div>
        
    )

}

export default Profile;
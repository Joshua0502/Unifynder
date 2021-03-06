import React, {useContext, useState, useEffect} from 'react';
import {Stack, Container, Typography, Dialog, DialogActions, DialogContent, Button, DialogContentText, IconButton, List , ListItem, Table, TableCell, TableRow, TableBody, TableHead, Rating, Tooltip, Link } from '@mui/material';
import SnackBar from '../components/SnackBar';
import FeatherIcon from 'feather-icons-react'
import { useNavigate, useParams } from 'react-router-dom'

import Loader from "../components/Loader"
import Layout from '../layout/Layout'
import axios from '../services/axios';
import { UserContext } from '../services/UserContext'
import Input from '../components/TextField/Input'

export default function University() {
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(localStorage.getItem("admin"));
  const [uniData, setUniData] = useState({});
  const [courses, setCourses] = useState(null);
  const [facilities, setFacilities] = useState(null);
  const [comments, setComments] = useState(null);
  const [comment, setComment] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [open, setOpen] = useState(false)
  const [dopen, setDopen] = useState(false)
	const [error, setError] = useState('')
  const [index, setIndex] = useState(null)

  const {user, setUser } = useContext(UserContext);
  let { id } = useParams();

  useEffect(()=>{
    axios()
    .post('/university/getOneUni',{
      id: id
    })
    .then(res => {
      setUniData(res.data)
      setComments(res.data.comments)
    })

  }, [])

  useEffect(()=>{
    if(uniData.Courses){
      setCourses(uniData.Courses.split(', '))
      setFacilities(uniData.Facilities.split(', '))
    }
  }, [uniData])

  useEffect(()=>{
    !admin && axios()
    .get('/user/inWatchlist',{params: {
      college: id,
      user: user
    }})
    .then(res => setInWatchlist(res.data))
  }, [])

  const addWatchlist = () =>{
    setOpen(true)
    if(inWatchlist){
      setError("Removed from Watchlist")
      axios()
      .post('/user/removeWatchlist',{
        user: user,
        collegename: uniData.College_Name
      })
      .then(res => setInWatchlist(res.data))
    }else{
      setError("Added to Watchlist")
      axios()
      .post('/user/addToWatchlist',{
        user: user,
        collegename: uniData.College_Name
      })
      .then(res => setInWatchlist(res.data))
    }
  }

  const submitHandler = (e) =>{
    e.preventDefault();
    axios()
    .post('/university/comment', {
      collegeName: uniData.College_Name,
      commentbody: comment
    })
    .then(res => {
      setUniData(res.data)
      setComments(res.data.comments)
    })
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
        return
    }
    setOpen(false)
  }

  const editUni = () =>{
    navigate('/editUni', {state: uniData})
  }

  const sendLogin = () => {
    navigate("/authenticate")
  }

  const deleteComment = () =>{
    axios()
    .post("/university/deletecomment", {
      collegeName: uniData.College_Name,
      value: comments,
      index: index
    })
    .then(res =>{
      setComments(res.data.comments)
    })
    setDopen(false)
  }

  const dhandleClickOpen = (index) => {
    setDopen(true);
    setIndex(index)
  };

  const dhandleClose = () => {
    setDopen(false);
  };

  return (
    <Layout>
      <SnackBar open={open} handleClose={handleClose} error={error} />
      <Dialog
        open={dopen}
        onClose={dhandleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={dhandleClose}>Cancel</Button>
          <Button variant='contained' onClick={deleteComment} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth='lg'>
        {!courses ? <Loader/> :
        <Stack direction='column' justifyContent='center' gap={2} my={3}>
          <Stack direction='row' alignItems='center' gap={4}>
            <img style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 4}} src={uniData.Images} alt={uniData.College_Name} />
            <Stack sx={{flexGrow: 2}} justifyContent='space-between' direction='row' alignItems='center'>
              <Stack gap={1}>
                <Typography gutterBottom variant="h6" sx={{margin: 0}}>{uniData.College_Name}</Typography>
                <Rating name="rating" value={uniData.Rating} precision={0.5} readOnly />
                <Stack direction='row' alignItems='center' gap={1}>
                    <FeatherIcon size={18} icon='map-pin' />
                    <Typography variant="subtitle2" color="text.secondary">{uniData.City + ', ' + uniData.State}</Typography>
                </Stack>
                <Stack direction='row' alignItems='center' gap={1}>
                    <FeatherIcon size={18} icon='clipboard' />
                    <Typography variant="subtitle2" color="text.secondary">{uniData.University}</Typography>
                </Stack>
              </Stack>
              {admin ? <Tooltip title="Edit" arrow><IconButton onClick={editUni}><FeatherIcon icon='edit-2' /></IconButton></Tooltip> :
               user ? <Tooltip title="Bookmark" arrow><IconButton onClick={addWatchlist} variant={inWatchlist ? 'off' : 'none'}><FeatherIcon icon='bookmark' /></IconButton></Tooltip> :
                <Tooltip title="Login to Watchlist">
                  <IconButton><FeatherIcon icon='bookmark' /></IconButton>
                </Tooltip>
              }
            </Stack>
          </Stack>
          <Typography variant="h5">Overview</Typography>
          <Stack direction='column' gap={2}>
            <Stack direction='row' alignItems='center'  gap={2}>
              <Stack direction='row' gap={2}>
                <FeatherIcon size={18} icon='users' />
                <Typography variant="subtitle2" color="text.secondary">{uniData.Total_Students} Seats</Typography>
              </Stack>
              <Stack direction='row' gap={2}>
                <FeatherIcon size={18} icon='briefcase' />
                <Typography variant="subtitle2" color="text.secondary">{uniData.Total_Faculty} Faculty Members</Typography>
              </Stack>
              <Stack direction='row' gap={2}>
                <FeatherIcon size={18} icon='calendar' />
                <Typography variant="subtitle2" color="text.secondary">Established in {uniData.Established_Year}</Typography>
              </Stack>
            </Stack>
            <Stack>
              <Stack direction='row' alignItems='center' gap={1}>
                  <FeatherIcon size={18} icon='layers' />
                  <Typography variant="subtitle2" color="text.secondary">???{Math.floor(uniData.Average_Fees).toLocaleString('en-IN')}</Typography>
                </Stack>
              </Stack>
          </Stack>
          <Typography variant="h5">Facilities</Typography>
          <Stack direction='column' gap={2}>
            <Stack direction='row' alignItems='center'  gap={2}>
              {facilities.includes('Library') &&
                <Stack direction='row' gap={2}>
                  <FeatherIcon size={18} icon='book-open' />
                  <Typography variant="subtitle2" color="text.secondary">Library</Typography>
                </Stack>
              }
              {facilities.includes('Cafeteria') &&
                <Stack direction='row' gap={2}>
                  <FeatherIcon size={18} icon='coffee' />
                  <Typography variant="subtitle2" color="text.secondary">Cafeteria</Typography>
                </Stack>
              }
              {facilities.includes('Sports') &&
                <Stack direction='row' gap={2}>
                  <FeatherIcon size={18} icon='target' />
                  <Typography variant="subtitle2" color="text.secondary">Sports</Typography>
                </Stack>
              }
              {facilities.includes('Boys Hostel') &&
                <Stack direction='row' gap={2}>
                  <FeatherIcon size={18} icon='home' />
                  <Typography variant="subtitle2" color="text.secondary">Hostel</Typography>
                </Stack>
              }
              {facilities.includes('Wifi') &&
                <Stack direction='row' gap={2}>
                  <FeatherIcon size={18} icon='wifi' />
                  <Typography variant="subtitle2" color="text.secondary">WiFi</Typography>
                </Stack>
              }
              {facilities.includes('Transport') &&
                <Stack direction='row' gap={2}>
                  <FeatherIcon size={18} icon='truck' />
                  <Typography variant="subtitle2" color="text.secondary">Transport</Typography>
                </Stack>
              }
            </Stack>
          </Stack>
          <Typography variant="h5">Courses</Typography>
          <Stack direction='row' alignItems='center' gap={2} mx={2}>
            <List sx={{ listStyleType: 'disc' }}>
              {courses.map((value)=>{
                return(<ListItem sx={{ display: 'list-item' }}>{value}</ListItem>)
              })}
            </List>
          </Stack>
          <Typography variant="h5">Cut Off</Typography>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell>Cap Round</TableCell>
                <TableCell>Cutoff</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  Cap Round 1
                </TableCell>
                <TableCell>{uniData.Cutoff_Round_One}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Cap Round 2
                </TableCell>
                <TableCell>{uniData.Cutoff_Round_Two}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Typography variant="h5">Comments</Typography>
            {!comments ? <Loader/> :
            <Stack>
              {!admin && (user ?
                <form onSubmit={(event) => submitHandler(event)}>
                  <Input
                      name='comment'
                      label='Share your thoughts'
                      fullidth={true}
                      handleChange={(event) => setComment(event.target.value)}
                      value={comment}
                      type='text'
                    />
                </form>:
                <Typography py={1} variant='subtitle2'>
                  <Link
                    sx={{ pr: '8px', cursor: 'pointer' }}
                    underline='hover'
                    onClick={() => {
                      sendLogin()
                    }}
                  >
                    Sign up
                  </Link>
                  to comment
                </Typography>
              )}
              {comments.map((value, index)=>
                <Stack direction='row' gap={4} justifyContent='space-between' alignItems='center' sx={{backgroundColor: '#3a3a3a', borderRadius: 1, marginTop: 2, padding: '8px 16px'}}>
                  <Typography variant="subtitle2">{value}</Typography>
                  {admin &&
                  <Tooltip title="Delete Comment">
                    <IconButton onClick={() => dhandleClickOpen(index)}><FeatherIcon size={16} icon='trash' /></IconButton>
                  </Tooltip>}
                </Stack>
              )}
            </Stack>
            }
        </Stack>
        }
      </Container>
    </Layout>
  );
}



/*
https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-four/?e=gs2020&p=build-a-react-app-three
taken from the "Write frontend code to interact with the API" step
*/
import React, { useState, useEffect } from 'react';
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Flex,
  Text,
  TextField,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";


const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes(){
    const apiData = await API.graphql( {query: listNotes});
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
    if(!!data.image) await Storage.put(data.name,image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data},
      });
      fetchNotes();
      event.target.reset();
  }

  async function deleteNote ({ id , name }){
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name)
    await API.graphql({
      query: deleteNoteMutation,
      variables: {input: { id } },
      });
  }

  return (
    <View className="App">
      <Heading level={1}> My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
            />
            <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>      
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
              key={note.id || note.name}
              direction="row"
              justifyContent="center"
              alignItems="center"
              >
              <Text as="strong" fontWeight={700}>
                {note.name}
              </Text>
              <Text as="span">{note.description}</Text>
              {note.image && 
              (<Image
                src={note.image}
                alt={`visual aid for ${notes.name}`}
                style={{ width: 400}}
                />
                )}
              <Button variation="link" onClick={() => deleteNote(note)}>
                Delete Note
              </Button>
            </Flex>
        ))}
      </View>
      <View 
        name="image"
        as="input"
        type="file"
        style={{ alignSelf: "end"}}
      />
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};



/*function App({signOut}) {
  return (
    <View className="App">
      <Card>
        <Image src={logo} className="App-logo" alt="logo" />
        <Heading level={1}>We now have Auth!</Heading>
      </Card>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}
*/
export default withAuthenticator(App);

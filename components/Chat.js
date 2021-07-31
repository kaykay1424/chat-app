import React from 'react';
import {View, StyleSheet, Platform, KeyboardAvoidingView, Text} from 'react-native';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';

/********* Firebase **********/ 
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: []
		}

        const firebaseConfig = {
            apiKey: "AIzaSyAOCBRokgmn-xCXnvuPSK93Y_0td4wEp1g",
            authDomain: "chat-app-57dff.firebaseapp.com",
            projectId: "chat-app-57dff",
            storageBucket: "chat-app-57dff.appspot.com",
            messagingSenderId: "31717835668",
            appId: "1:31717835668:web:c8f9c3b10fb83c813a8581"
        };

        if (!firebase.apps.length){
            firebase.initializeApp(firebaseConfig);
        }
	}

    // Add message to messages collection
    addMessage(messages) {
        this.referenceMessages.add(messages[messages.length-1]);
    }

	componentDidMount() {
        this.props.navigation.setOptions({title: this.props.route.params.name}); // Set title of screen to user's name

        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
  
            this.setState({
                userId: user.uid,
            });

            this.referenceMessages = firebase.firestore().collection('messages');
            if (this.referenceMessages) this.unsubscribeMessages = this.referenceMessages.onSnapshot(this.onCollectionUpdate);
        });
	}
    
    componentWillUnmount() {
        // stop listening to authentication
        this.authUnsubscribe();
        // stop listening for changes
        this.unsubscribeMessages();
    }

    // Update messages state variable
    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        
        // Loop through documents
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                _id: data._id,
                createdAt: data.createdAt.toDate(),
                text: data.text,
                user: data.user
            });
        });

        this.setState({
            messages,
        });
    };

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.addMessage(messages);
        });

        
    }

    // Add styles to speech bubble
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#000'
                    }
                }}
            />
        )
      }

    render() {
        
        return (
            <View style={[styles.mainContainer, {backgroundColor: this.props.route.params.bgColor}]}>
                <GiftedChat
                    style={{width: '80%'}}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    renderBubble={this.renderBubble}
                    user={{
                        _id: this.state.userId,
                        name: this.props.route.params.name
                    }}
                    renderUsernameOnMessage={true}
                />
                { 
                    Platform.OS === 'android' 
                        ? <KeyboardAvoidingView behavior="height" /> 
                        : null
                }
            </View>
        );
    };
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: 20
    },
});
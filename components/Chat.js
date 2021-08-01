import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {View, StyleSheet, Platform, Text, KeyboardAvoidingView} from 'react-native';
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';

/********* Firebase **********/ 
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            isConnected: null,
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
	
    // Get messages from local storage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch(error) {
            console.log(error.message);
        }
    }

    // Save message to local storage
    async saveMessage() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch(error) {
            console.log(error.message);
        }
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
            messages
        });
    };

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.addMessage(messages);
            this.saveMessage();
        });
    }

    // Add styles to speech bubble
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: 'navy'
                    }
                }}
            />
        )
    }

    // Render user keyboard when user is online only
    renderInputToolbar = (props) => {
        if (this.state.isConnected === true) {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
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
                    renderInputToolbar={this.renderInputToolbar}
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

    componentDidMount() {
        this.props.navigation.setOptions({title: this.props.route.params.name}); // Set title of screen to user's name

        NetInfo.fetch().then(connection => {
            if (connection.isConnected) {
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                    if (!user) {
                      await firebase.auth().signInAnonymously();
                    }
  
                    this.setState({
                        userId: user.uid || '',
                    });

                    this.referenceMessages = firebase.firestore().collection('messages');
                    if (this.referenceMessages) this.unsubscribeMessages = this.referenceMessages.onSnapshot(this.onCollectionUpdate);
                });
            } else {
                this.getMessages();
            }

            this.setState({
                isConnected: connection.isConnected
            })
        });
    }
    
    componentWillUnmount() {
        // stop listening to authentication
        this.authUnsubscribe();
        // stop listening for changes
        this.unsubscribeMessages();
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: 20
    },
    welcomeText: {
        backgroundColor: '#fff',
        padding: 20,
        textAlign: 'center'
    }
});
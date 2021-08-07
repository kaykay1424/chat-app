import React from 'react';
import {Alert, AppState, LogBox} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
    View, 
    StyleSheet, 
    ImageBackground, 
    Platform, 
    Text, 
    KeyboardAvoidingView
} from 'react-native';
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';
import MapView from 'react-native-maps';
import PropTypes from 'prop-types';

import CustomActions from './CustomActions';

/********* Firebase **********/ 
const firebase = require('firebase');
require('firebase/firestore');

import {languageProperties} from '../utils';

LogBox.ignoreAllLogs(); // ignore Error logs popping up on device

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.bannerTimeout;
        this.chatRoom = this.props.route.params.chatRoom;
        this.language = languageProperties[this.chatRoom];
        this.name = this.props.route.params.name;
        this.state = {
            avatar: null,
            image: null,
            isConnected: null,
            location: null,
            messages: [],
            users: []
        };

        const firebaseConfig = {
            apiKey: 'AIzaSyBeSlAdyhq1pgwA4M0bbkU8khHsIR_b_JY',
            authDomain: 'chat-app-a6e73.firebaseapp.com',
            projectId: 'chat-app-a6e73',
            storageBucket: 'chat-app-a6e73.appspot.com',
            messagingSenderId: '343839365323',
            appId: '1:343839365323:web:6fa6b078f02f5008f1234e'
        };
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    }

    // Add message to messages collection
    addMessage(message) {
        this.referenceMessages.add(message);
        this.setState({
            image: null,
            location: null
        });
    }

    deleteDocument = async(reference, _id) => {
        reference.where('_id', '==', _id).get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    reference.doc(doc.id).delete();
                });
            });
        
    }

    onLongPress = (context, message) => {
        Alert.alert(
            'Delete Message',
            'Do you want to delete this message?',
            [
                { 
                    text: 'No'
                },
                { 
                    text: 'Yes', 
                    onPress: () => 
                        this.deleteDocument(this.referenceMessages, message._id)
                }
            ]
        );
    }
	
    // Get messages from local storage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem(
                `${this.chatRoom}-messages`)
                 || [];
            this.setState({
                currentUsers: 0,
                messages: messages.length > 0 ? JSON.parse(messages) : []
            });
        } catch(error) {
            console.log(error.message); // eslint-disable-line no-console
        }
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            this.updateCurrentUsers('add');
        } else {  
            if (!this.state.choosingOption)
                this.updateCurrentUsers('delete');
        }
    }

    // Save message to local storage
    async saveMessage() {
        try {
            await AsyncStorage.setItem(
                `${this.chatRoom}-messages`,
                JSON.stringify(this.state.messages
                ));
        } catch(error) {
            console.log(error.message); // eslint-disable-line no-console
        }
    }

    // Update messages state variable when messages collection changes
    onCollectionUpdate = async (querySnapshot) => {
        const messages = [];

        const name = await AsyncStorage.getItem('name'),
            bgColor = await AsyncStorage.getItem('bgColor');

        if (!name)
            await AsyncStorage.setItem('name', this.name);
        else if (name && name !== this.name) {
            await AsyncStorage.setItem('name', this.name);
        }

        if (!bgColor)
            await AsyncStorage.setItem(
                'bgColor', 
                this.props.route.params.bgColor
            );
        else if (bgColor && bgColor !== this.props.route.params.bgColor) {
            await AsyncStorage.setItem(
                'bgColor', 
                this.props.route.params.bgColor
            );
        }
        
        // Loop through documents
        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            let updateDoc = false;
            const user = data.user;
           
            // If user's name needs to be updated in db
            if (
                (doc.id !== 'system') 
                && (name !== user.name) 
                && (user._id === this.state.userId)
            ) {
                user.name = this.name;
                updateDoc = true;
            }

            // If user's avatar needs to be updated in db
            if (
                (doc.id !== 'system') && 
                (this.state.avatar !== user.avatar) && 
                (user._id === this.state.userId)
            ) {
                if (!this.state.avatar) this.state.avatar = user.avatar;
                if (this.state.avatar) user.avatar = this.state.avatar;
                updateDoc = true;
            }

            // If document needs to be updated
            if (updateDoc) {
                const newData = {...data};
                newData.user = user;
                this.referenceMessages.doc(doc.id).set(newData);
            }

            messages.push({
                _id: data._id,
                createdAt: data.createdAt.toDate(),
                location: data.location,
                image: data.image,
                text: data.text,
                user: data.user
            });
        });

        // Sort messages so they are displayed in most recent order
        messages.sort((message1, message2) => {
            return message1.createdAt - message2.createdAt;
        });

        this.setState({messages});
        this.saveMessage();
    };

    onSend(message = {}) {
        message = {
            ...message,
            image: this.state.image,
            location: this.state.location,
        };

        message['user'] = {
            ...message['user'],
            avatar: this.state.avatar
        }; 

        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, message),
            
        }), () => {
            this.addMessage(message);
            this.saveMessage();
        });
    }

    // Add styles/functions to speech bubble
    renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                textStyle={{
                    left: {
                        color: this.language.leftBubbleColor
                    },
                    right: {
                        color: this.language.rightBubbleColor
                    }
                }}
                wrapperStyle={{
                    left: {
                        backgroundColor: this.language.leftBubbleBgColor,
                    },
                    right: {
                        backgroundColor: this.language.rightBubbleBgColor,
                    }
                }}
                onLongPress={this.onLongPress}
            />
        );
    }

    // Create actions for user to take when clicking on action button
    renderCustomActions = (props) => {
        return <CustomActions 
            savePhoto={this.savePhoto}
            setChoosingOption={this.setChoosingOption}
            setLocation={this.setLocation}
            {...props} 
        />;
    };

    renderCustomView = (props) => {
        const {currentMessage} = props;
       
        if (currentMessage.location) {
            return (
                <MapView
                    style={{width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3}}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
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

    savePhoto = async (uri, imageType) => {
        const response = await fetch(uri),
            blob = await response.blob(),
            imageName = uri.substr(uri.lastIndexOf('/')+1, uri.length),
            ref = firebase.storage().ref().child(imageName),
            snapshot = await ref.put(blob),
            downloadURL = await snapshot.ref.getDownloadURL();

        imageType === 'image' 
            ? this.setState({image: downloadURL})
            : this.setState({avatar: downloadURL});
        this.setChoosingOption(false);
    }

    setChoosingOption = (status) => {
        this.setState({
            choosingOption: status
        });
    }

    setLocation = (location) => {
        this.setState({
            location
        });
    }

    updateCurrentUsers = async (action) => {
        let currentUserExists = false;
        await this.referenceCurrentUsers.where(
            '_id', '==', this.state.userId
        ).get().then((query) => {          
            query.forEach((doc) => {
                if (doc.data()._id === this.state.userId) 
                    currentUserExists = true;
            });
        });

        if (action === 'add') {
            if (!currentUserExists)
                this.referenceCurrentUsers.add({
                    _id: this.state.userId,
                    name: this.name
                });  
        } else if (action === 'delete') {
            if (currentUserExists) 
                this.deleteDocument(
                    this.referenceCurrentUsers, 
                    this.state.userId
                );
        }

        let currentUsers = await this.referenceCurrentUsers.get();
        currentUsers = currentUsers.size;

        // Only update currentUsers state 
        // if user has joined chat room (not when they exit)
        action === 'add' ? this.setState({currentUsers}): null;
    }

    render() {
        let bannerWelcomeText;
        
        // If user joins chat room
        if (this.state.changedUser && 
            this.state.changedUserStatus === 'active') {
            bannerWelcomeText = <View style={{
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <Text 
                    style={styles.welcomeText}
                >
                    {this.language.bannerIndividualJoinText}
                </Text> 
                <Text style={[styles.welcomeText, {
                    color: this.language.color1,
                    marginLeft: 5
                }]}>{this.state.changedUser}!</Text>
            </View>;
            // If user leaves chat room
        } else if (
            this.state.changedUser && 
            this.state.changedUserStatus === 'inactive'
        ) {
            bannerWelcomeText = <View style={{
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <Text 
                    style={styles.welcomeText}
                >
                    {this.language.bannerIndividualExitText}
                </Text> 
                <Text style={[styles.welcomeText, {
                    color: this.language.color1,
                    marginLeft: 5
                }]}>{this.state.changedUser}!</Text>
            </View>;
        } else {
            bannerWelcomeText = <View style={{
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <Text 
                    style={styles.welcomeText}
                >
                    {this.language.bannerGroupText}!
                </Text>
            </View>;
        }
        
        return (
            <>
                <View 
                    style={styles.banner}   
                >
                    
                    <ImageBackground 
                        source={this.language.flag} 
                        resizeMode="cover" 
                        style={styles.imageBackground}
                    >
                        <View 
                            style={
                                {
                                    backgroundColor: 'rgba(255,255,255,.8)',
                                    flexDirection: 'column',
                                    height: '100%', 
                                    justifyContent: 'center',
                                    width: '100%', 
                                }}
                        >
                            <View>
                                {this.state.isConnected 
                                    ? bannerWelcomeText : null}
                            </View> 
                            <Text 
                                style={[
                                    styles.welcomeText, 
                                    styles.currentUsersText
                                ]}
                            >
                                { 
                                    this.state.isConnected 
                                        ? `${this.language.currentUserText}: ${this.state.currentUsers}`
                                        : null
                                }
                            </Text> 
                        </View>
                    </ImageBackground> 
                </View>
                <View 
                    style={
                        [
                            styles.mainContainer, 
                            {backgroundColor: this.props.route.params.bgColor}
                        ]}>
                    <GiftedChat
                        style={{width: '80%'}}
                        infiniteScroll
                        isLoadingEarlier
                        inverted={false}
                        messages={this.state.messages}
                        onSend={messages => this.onSend(messages[0])}
                        user={{
                            _id: this.state.userId,
                            avatar: this.state.avatar,
                            name: this.name
                        }}
                        renderActions={this.renderCustomActions}
                        renderBubble={this.renderBubble}
                        renderCustomView={this.renderCustomView}
                        renderInputToolbar={this.renderInputToolbar}
                        renderUsernameOnMessage
                        scrollToBottom
                        showUserAvatar
                    />
                
                    {/* Make sure keyboard doesn't hide message input field */} 
                    { 
                        Platform.OS === 'android' 
                            ? <KeyboardAvoidingView behavior="height" /> 
                            : null
                    }
                </View>
            </>
        );
    }

    componentDidMount() {
        // Set title of screen to user's name
        this.props.navigation.setOptions(
            {title: this.name}
        ); 

        NetInfo.fetch().then(connection => {
            // If user is connected to internet, 
            // get users and messages from firestore db
            if (connection.isConnected) {
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(
                    async (user) => {
                        if (!user) {
                            await firebase.auth().signInAnonymously();
                            return;
                        }
                   
                        this.referenceMessages = firebase.firestore()
                            .collection('chatRooms').doc(this.chatRoom)
                            .collection('messages');

                        if (this.referenceMessages) this.unsubscribeMessages = 
                            this.referenceMessages.onSnapshot(
                                this.onCollectionUpdate);

                        this.referenceCurrentUsers = firebase.firestore()
                            .collection('chatRooms')
                            .doc(this.chatRoom).collection('users');

                        await this.setState({
                            userId: user.uid,
                        }, () => this.updateCurrentUsers('add'));
                    
                        if (this.referenceCurrentUsers) {
                            this.unsubscribeCurrentUsers = 
                            this.referenceCurrentUsers.onSnapshot(
                                (querySnapshot) => {
                                    clearTimeout(this.bannerTimeout);

                                    const updatedCurrentUsers = [];

                                    querySnapshot.forEach((doc) => {
                                        updatedCurrentUsers.push({
                                            _id: doc.data()._id,
                                            name: doc.data().name
                                        });
                                    });
    
                                    // Get user id for user that 
                                    // entered or exited chat room
                                    const getChangedUser = () => {
                                        const userIds = 
                                            this.state.users.map((user) => {
                                                return user._id;
                                            }),
                                            updatedUserIds = 
                                            updatedCurrentUsers.map((user) => {
                                                return user._id;
                                            }),
                                            allUserIds = 
                                            userIds.concat(updatedUserIds),
                                            filteredIds = allUserIds
                                                .filter((id) => {
                                                    return allUserIds
                                                        .indexOf(id) === 
                                                allUserIds.lastIndexOf(id);
                                                });
          
                                        return filteredIds[0];
                                    };
                                    let changedUser;

                                    // Use users list that is longest 
                                    // to loop through 
                                    // and find user that is not in both lists 
                                    // (user that exited or entered chat room)
                                    const users = 
                                        this.state.users.length > 
                                        updatedCurrentUsers.length
                                            ? this.state.users
                                            : updatedCurrentUsers;
                                
                                    for (let i = 0; i < users.length; i++) {
                                        // If current user in loop is user 
                                        // that entered or exited chat room
                                        if (getChangedUser(users[i]._id) === 
                                            users[i]._id) {
                                            changedUser = users[i].name;
                                            break;
                                        }
                                    }
 
                                    // If user has joined chat room
                                    if (this.state.users.length < 
                                        updatedCurrentUsers.length) {
                                        this.setState({
                                            changedUserStatus: 'active'
                                        });
                                        this.setState({changedUser});

                                    // If user has exited chat room
                                    } else if (this.state.users.length > 
                                        updatedCurrentUsers.length) {
                                        this.setState({
                                            changedUserStatus: 'inactive'
                                        });
                                        this.setState({
                                            changedUser
                                        });
                                    }
                               
                                    this.setState({
                                        currentUsers: 
                                        updatedCurrentUsers.length,
                                        users: updatedCurrentUsers
                                    });
                            
                                    // Used to remove user's name from 
                                    // welcome message in banner
                                    this.bannerTimeout = 
                                    setTimeout(() => this.setState({
                                        changedUser: null,
                                        changedUserStatus: ''
                                    }), 5000);

                                    // Update messages in db/state 
                                    // with user avatar/name
                                    // if user has made changes to either one
                                    this.referenceMessages.get()
                                        .then(async (querySnapshot) => {
                                            const messages = [];
                                            const name = await AsyncStorage
                                                .getItem('name');
                                            // Loop through documents
                                            querySnapshot
                                                .forEach(async (doc) => {
                                                    const data = doc.data();
                                                    let updateDoc = false;
                                                    const user = data.user;
           
                                                    // If user's name needs to 
                                                    // be updated in db
                                                    if (
                                                        (doc.id !== 'system') 
                                                        && 
                                                        (name !== user.name) 
                                                        && 
                                                        (user._id === 
                                                            this.state.userId)
                                                    ) {
                                                        user.name = this.name;
                                                        updateDoc = true;
                                                    }

                                                    // If user's avatar needs 
                                                    // to be updated in db
                                                    if (
                                                        (doc.id !== 'system') 
                                                        && 
                                                        (this.state.avatar 
                                                            !== user.avatar) 
                                                        && 
                                                        (user._id === 
                                                            this.state.userId)
                                                    ) {
                                                        // if user chooses 
                                                        // avatar for first time
                                                        if (!this.state.avatar) 
                                                            this.state.avatar = 
                                                            user.avatar; 
                                                        // if user updates
                                                        // avatar    
                                                        if (this.state.avatar) 
                                                            user.avatar = 
                                                            this.state.avatar; 
                                                        updateDoc = true;
                                                    }
                                
                                                    // If doc needs 
                                                    // to be updated
                                                    if (updateDoc) {
                                                        const newData = 
                                                        {...data};
                                                        newData.user = user;
                                                        this.referenceMessages
                                                            .doc(doc.id).set(
                                                                newData
                                                            );
                                                    }
  
                                                    // Don't add system message
                                                    // to messages state
                                                    // variable
                                                    // It is only added to db
                                                    // to update other users 
                                                    // when a new user 
                                                    // has joined the chat
                                                    if (doc.id !== 'system') {
                                                        messages.push({
                                                            _id: data._id,
                                                            createdAt: 
                                                                data.createdAt
                                                                    .toDate(),
                                                            location: 
                                                            data.location,
                                                            image: data.image,
                                                            text: data.text,
                                                            user: data.user
                                                        });
                                                    }
                                                    this.saveMessage();
                                                });

                                            // Sort messages so 
                                            // they are displayed 
                                            // in most recent order
                                            messages.sort(
                                                (message1, message2) => {
                                                    return message1.createdAt - 
                                                message2.createdAt;
                                                });

                                            this.setState({messages});
                                        });
                                });
                        }
                    });
                AppState.addEventListener('change', this._handleAppStateChange);
            } else {
                this.getMessages();
            }

            this.setState({
                isConnected: connection.isConnected
            });
        });
    }
    
    componentWillUnmount() {
        // If user is online
        if (this.state.isConnected) {
            // Stop listening to authentication
            this.authUnsubscribe();
            // Stop listening for changes to messages/users
            this.unsubscribeMessages();
            this.unsubscribeCurrentUsers();
            this.updateCurrentUsers('delete');
            AppState.removeEventListener('change', this._handleAppStateChange);
        }
    }
}

const styles = StyleSheet.create({
    banner: {
        height: 60,
        width: '100%'
    },
    welcomeText: {
        fontWeight: 'bold',     
        fontSize: 24, 
        opacity: 1,
    },
    currentUsersText: {
        color: '#757083',
        fontSize: 16,
        textAlign: 'center'
    },
    imageBackground: {
        width: '100%', 
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center', 
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: 20
    },
});

Chat.propTypes = {
    navigation: PropTypes.shape({
        setOptions: PropTypes.func
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            bgColor: PropTypes.string.isRequired,
            chatRoom: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        })
    }).isRequired
};
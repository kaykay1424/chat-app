import React from 'react';
import {View, StyleSheet, Platform, KeyboardAvoidingView} from 'react-native';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';

export default class Chat extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: []
		}
	}

	componentDidMount() {
		this.setState({
			messages: [
                {
                    _id: 1,
                    text: `${this.props.route.params.name} has entered the chat`,
                    createdAt: new Date(),
                    system: true,
                },
				{
				    _id: 2,
				    text: 'Hello developer',
				    createdAt: new Date(),
				    user: {
					    _id: 2,
					    name: 'React Native',
					    avatar: 'https://placeimg.com/140/140/any',
				    },
				},
                
			]
		});

        this.props.navigation.setOptions({title: this.props.route.params.name}); // Set title of screen to user's name
	}

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }));
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
                    _id: 1,
                  }}
                />
                { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
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
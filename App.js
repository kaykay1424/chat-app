import React from 'react';
import 'react-native-gesture-handler';

/*********** Navigation ***********/ 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

/************* Components *********/
import Chat from './components/Chat';
import ChatRooms from './components/ChatRooms';
import Start from './components/Start';

const Stack = createStackNavigator();

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStatus: '',
            dbCollection: '',
            inChatRoom: '',
            text: ''
        };
    }
          
    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Start"
                >
                    <Stack.Screen
                        name="Start"
                        component={Start}
                    />
                    <Stack.Screen
                        name="Chat Rooms"
                        component={ChatRooms}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={Chat}    
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}


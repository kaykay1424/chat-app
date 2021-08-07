import React from 'react';
import {
    View, 
    ImageBackground, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

import Icon from '../assets/icon.svg';

export default class Start extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            bgColor: styles.bgColor1.backgroundColor,
            name: '',
        };
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <ImageBackground 
                    source={require('../assets/background-image.png')} 
                    resizeMode="cover" 
                    style={{width: '100%', height: '100%'}}
                >
                    <View style={styles.mainContainer}>
                        <Text style={styles.pageTitle}>Polychat</Text>    
                        <View style={styles.userInputContainer}>
                            <View style={styles.textInputContainer}>
                                <Icon style={styles.icon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Your name"
                                    onChangeText={(name) => 
                                        this.setState({name})}
                                    value={this.state.name} 
                                />
                            </View>
                            <View style={styles.chooseColorsContainer}>
                                <Text 
                                    style={styles.chooseColorsText}
                                >
                                    Choose your background color:
                                </Text>
                                <View style={styles.bgColorsContainer}>
                                    {[1, 2, 3, 4].map((element, i) => {
                                        const bgColor = 'bgColor' + element;

                                        return (
                                            <View 
                                                key={i} 
                                                style={
                                                    [
                                                        styles[bgColor], 
                                                        styles
                                                            .bgColorContainer, 
                                                        this.state.bgColor === 
                                                        styles[bgColor]
                                                            .backgroundColor 
                                                            ? styles
                                                                .selectedBGColor 
                                                            : null
                                                    ]
                                                }
            
                                            >
                                                <TouchableOpacity 
                                                    style={[styles.bgColor, 
                                                        styles[bgColor]]} 
                                                    onPress={() => 
                                                    {this.setState(
                                                        {bgColor:styles[bgColor]
                                                            .backgroundColor});
                                                    }}
                                                ></TouchableOpacity>
                                            </View>
                                        );
                                    })} 
                                </View>
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => 
                                        this.props.navigation.navigate(
                                            'Chat Rooms', 
                                            {
                                                name: this.state.name, 
                                                bgColor: this.state.bgColor
                                            })}
                                >
                                    <Text 
                                        style={styles.buttonText}>
                                            Choose Chat Room
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ImageBackground>   
            </View>
        );
    }

    async componentDidMount() {
        const localBgColor = await AsyncStorage.getItem('bgColor');
        const localName = await AsyncStorage.getItem('name');

        this.setState({
            bgColor: localBgColor ? localBgColor: this.state.bgColor,
            name: localName ? localName : this.state.localName
        });
    }

}


const styles = StyleSheet.create({
    bgColorContainer: { 
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 35,
        borderWidth: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50,
        width: 50
    },
    bgColorsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '84%'
    },
    bgColor: {
        borderRadius: 20,
        height: 40,
        width: 40
    },
    bgColor1: {
        backgroundColor: '#090C08',
        borderColor: '#090C08',
    },
    bgColor2: {
        backgroundColor: '#474056',
        borderColor: '#474056'
    },
    bgColor3: {
        backgroundColor: '#8A95A5',
        borderColor: '#8A95A5'
    },
    bgColor4: {
        backgroundColor: '#B9C6AE',
        borderColor: '#B9C6AE'
    },
    button: {
        backgroundColor: '#757083',
        flexDirection: 'column',
        height: 60,
        justifyContent: 'center',        
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: '30%',
        width: '88%'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16, 
        fontWeight: '600', 
        textAlign: 'center' 
    },
    chooseColorsContainer: {
        height: '30%',
        width: '88%'
    },
    chooseColorsText: {
        color: '#757083', 
        fontSize: 16, 
        fontWeight: '300', 
        marginTop: 20, 
        opacity: 1
    },
    icon: {
        width: '9%'
    },
    mainContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        paddingBottom: 30,
    },
    pageTitle: {
        flex: 1, 
        fontSize: 45, 
        fontWeight: '600', 
        marginTop: 10, 
        color: '#fff'
    },
    selectedBGColor: {
        borderWidth: 3
    },
    textInput: {
        height: 60,
        padding: 10, 
        paddingLeft: 0,
        fontSize: 16,
        width: '90%'
    },
    textInputContainer: {
        alignItems: 'center',
        borderWidth: 1,
        flexDirection: 'row',
        height: '20%',
        justifyContent: 'space-between',
        paddingLeft: 10,
        width: '88%'
    },
    userInputContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        height: '44%',
        justifyContent: 'space-evenly',
        minHeight: 300,
        width: '88%'
    }
});

Start.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired
    })
};
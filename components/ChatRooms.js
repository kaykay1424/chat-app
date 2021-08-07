import React from 'react';
import {
    View, 
    ImageBackground, 
    Text, 
    StyleSheet, 
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

import {languageProperties} from '../utils';

export default function ChatRooms({navigation, route}) {
    return (
        <View>
            {Object.keys(languageProperties).map((language) => 
                (<TouchableOpacity  
                    key={language}
                    style={styles.chatRoom}
                    onPress={() => 
                        navigation.navigate(
                            'Chat', {...route.params, chatRoom: language})}
                >
                    <ImageBackground 
                        source={languageProperties[language].flag} 
                        resizeMode="cover" 
                        style={styles.imageBackground}
                    >
                        <View 
                            style={[styles.chatRoomTextContainer,{
                                borderColor: 
                                languageProperties[language].color1,   
                            },]}>
                            <Text style={[styles.chatRoomText, {
                                color: languageProperties[language].color1
                            }]}>
                                {/* Capitalize first letter of language */}
                                {
                                    language[0].toUpperCase()
                                        .concat(language.slice(1,
                                            language.length))
                                }  
                            </Text>                    
                        </View>
                    </ImageBackground>
                </TouchableOpacity >)
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    chatRoom: {
        height: 100,
        width: '100%'
    },
    chatRoomTextContainer: {
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    chatRoomText: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
        padding: 5,
        textAlign: 'center',
        color: '#757083', 
        fontSize: 16, 
        margin: 'auto',
        opacity: 1,
        width: 100
    },
    imageBackground: {
        width: '100%', 
        height: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start'
    }
});

ChatRooms.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired
    }), 
    route: PropTypes.shape({
        params: PropTypes.shape({

        }).isRequired
    })
};
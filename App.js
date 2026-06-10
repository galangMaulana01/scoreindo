import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('matches');

  if (isShowSplash) {
    return (
      <View className="flex-1 bg-black">
        <Video
          source={require('./assets/splash.mp4')}
          style={{ width: '100%', height: '100%' }}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isMuted
          onPlaybackStatusUpdate={status => {
            if (status.didJustFinish) setIsShowSplash(false);
          }}
          onError={() => setIsShowSplash(false)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-latar">
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-xl">App sudah jalan, bro!</Text>
      </View>

      <View className="flex-row bg-kartu pb-4 pt-3 border-t border-gray-800">
        <TouchableOpacity onPress={() => setActiveView('matches')} className="flex-1 items-center">
          <Text className="text-2xl">⚽</Text>
          <Text className="text-[11px] text-gray-500">Jadwal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveView('standings')} className="flex-1 items-center">
          <Text className="text-2xl">📋</Text>
          <Text className="text-[11px] text-gray-500">Klasemen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

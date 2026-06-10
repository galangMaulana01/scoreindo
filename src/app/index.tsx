import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Svg, { Path, Rect } from 'react-native-svg';

// ==================== KONFIGURASI API (100% Sama) ====================
const API_BASE_URL = "https://sportmonks-tawny.vercel.app";
const TARGET_LEAGUE_IDS = [501];

export default function App() {
  // ==================== STATE MANAGEMENT ====================
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('matches'); // matches, standings, detail, team
  
  // State Data
  const [bannerData, setBannerData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  // ==================== FETCH LOGIC (Mirip fetchAndRenderMatches HTML) ====================
  useEffect(() => {
    fetchBanner();
    if (!isShowSplash) {
      fetchMatches();
    }
  }, [isShowSplash]);

  const fetchBanner = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/benner`);
      const data = await response.json();
      setBannerData(data);
    } catch (error) {
      console.error("Gagal load banner", error);
    }
  };

  const fetchMatches = async () => {
    setIsLoadingMatches(true);
    try {
      let fetchedMatches = [];
      let currentLeague = null;

      for (const leagueId of TARGET_LEAGUE_IDS) {
        const leagueRes = await fetch(`${API_BASE_URL}/leagues/${leagueId}`);
        const leagueJson = await leagueRes.json();
        const league = leagueJson?.data;
        if (!league) continue;
        currentLeague = league;

        let seasonId = league.currentseason?.id;
        if (!seasonId) continue;

        const standingsRes = await fetch(`${API_BASE_URL}/standings/seasons/${seasonId}`);
        const standingsJson = await standingsRes.json();
        const standings = standingsJson?.data || [];
        if (standings.length === 0) continue;

        const roundId = standings[0].round_id;
        const roundRes = await fetch(`${API_BASE_URL}/rounds/${roundId}`);
        const roundJson = await roundRes.json();
        const fixtureSummaries = roundJson?.data?.fixtures || [];

        for (const summary of fixtureSummaries) {
          const fixtureRes = await fetch(`${API_BASE_URL}/fixtures/${summary.id}?include=participants,scores`);
          const fixtureJson = await fixtureRes.json();
          if (fixtureJson.data) fetchedMatches.push(fixtureJson.data);
        }
      }
      setLeagueInfo(currentLeague);
      setMatches(fetchedMatches);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // ==================== KOMPONEN SPLASH SCREEN (Dengan Suara) ====================
  if (isShowSplash) {
    return (
      <View className="flex-1 bg-black justify-center items-center z-[10000]">
        <Video
          source={require('../../assets/splash.mp4')} // Pastikan lokasi mp4 bener
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isMuted={false} // <--- SUARA NYALA BRO!
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsShowSplash(false);
            }
          }}
          onError={() => setIsShowSplash(false)} // Anti glitch, kalau error langsung masuk app
        />
      </View>
    );
  }

  // ==================== KOMPONEN JADWAL (MATCHES VIEW) ====================
  const renderMatchesView = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header Logo */}
      <View className="pt-12 pb-2 backdrop-blur-md z-40 px-4">
        <Image source={require('../../assets/logo.png')} className="w-48 h-12" resizeMode="contain" />
      </View>

      {/* Banner */}
      {bannerData && (
        <View className="mx-4 my-2 relative overflow-hidden rounded-2xl bg-latar h-32 flex-row items-center px-5 border border-gray-800">
          <Image source={{ uri: bannerData.image_benner }} className="absolute left-0 bottom-0 h-36 w-36" resizeMode="contain" />
          <View className="ml-28 flex-1">
            <Image source={{ uri: bannerData.image_logo }} className="w-24 h-8 mb-2" resizeMode="contain" />
            <Text className="text-gray-400 text-sm max-w-[180px] leading-tight" numberOfLines={2}>
              {bannerData.desc}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL(bannerData.link)}
            className="bg-kartu px-6 py-3 rounded-2xl border border-gray-700"
          >
            <Text className="text-white font-bold text-lg">Join</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Container Matches */}
      <View className="px-4 mt-4 pb-24">
        {isLoadingMatches ? (
          // Skeleton Loading
          [1, 2, 3, 4, 5].map((_, i) => (
            <View key={i} className="mb-6">
              <View className="flex-row items-center gap-2 mb-3 px-1">
                <View className="w-5 h-5 bg-gray-800 rounded-full" />
                <View className="h-4 bg-gray-800 rounded w-32" />
              </View>
              <View className="bg-kartu p-4 rounded-xl mb-3 border border-gray-800 h-16" />
            </View>
          ))
        ) : matches.length === 0 ? (
          // Empty State
          <View className="items-center py-16">
            <Text className="text-5xl mb-3 opacity-30">⚽</Text>
            <Text className="text-gray-500 font-medium">Tidak ada jadwal yang tersedia untuk liga ini.</Text>
          </View>
        ) : (
          // List Data Matches
          <View className="mb-6">
            <View className="mb-3 flex-row items-center gap-2 px-1">
              {leagueInfo && <Image source={{ uri: leagueInfo.image_path }} className="w-10 h-10" resizeMode="contain" />}
              <Text className="font-bold text-lg text-white tracking-wider">{leagueInfo?.name}</Text>
            </View>

            {matches.map((fixture, index) => {
              const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home') || {};
              const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away') || {};
              const homeScore = fixture.scores?.find(s => s.description === "CURRENT" && s.score?.participant === "home")?.score.goals ?? "0";
              const awayScore = fixture.scores?.find(s => s.description === "CURRENT" && s.score?.participant === "away")?.score.goals ?? "0";
              const statusRaw = fixture.state?.short_name || "NS";
              const statusLabel = statusRaw === "FT" ? "FT" : (statusRaw === "NS" ? "Belum mulai" : statusRaw);

              return (
                <TouchableOpacity 
                  key={index}
                  onPress={() => setActiveView('detail')} // Nanti nyambung ke renderDetail()
                  className="flex-row items-center justify-between py-3 px-3 bg-kartu rounded-xl mb-3 border border-gray-800"
                >
                  {/* Home */}
                  <View className="flex-row items-center gap-2 w-[35%]">
                    <Image source={{ uri: homeTeam.image_path || 'https://placehold.co/40' }} className="w-8 h-8" resizeMode="contain" />
                    <Text className="text-xs font-semibold text-gray-200" numberOfLines={1}>{homeTeam.name}</Text>
                  </View>
                  
                  {/* Score & Status */}
                  <View className="items-center w-[30%]">
                    <Text className="text-xl font-black text-white">{homeScore} - {awayScore}</Text>
                    <View className="bg-gray-800 px-2 py-0.5 rounded-full mt-1">
                      <Text className="text-[10px] font-bold text-merah">{statusLabel}</Text>
                    </View>
                  </View>
                  
                  {/* Away */}
                  <View className="flex-row items-center justify-end gap-2 w-[35%]">
                    <Text className="text-xs font-semibold text-gray-200 text-right" numberOfLines={1}>{awayTeam.name}</Text>
                    <Image source={{ uri: awayTeam.image_path || 'https://placehold.co/40' }} className="w-8 h-8" resizeMode="contain" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-black relative">
      {/* Efek Blur Glow (Background) */}
      <View className="absolute -top-40 -left-32 w-[500px] h-[400px] bg-merah/20 rounded-full" style={{ opacity: 0.3 }} />
      <View className="absolute -top-32 -right-24 w-[400px] h-[300px] bg-kuning/20 rounded-full" style={{ opacity: 0.3 }} />

      {/* RENDER VIEW BERDASARKAN STATE */}
      {activeView === 'matches' && renderMatchesView()}
      
      {activeView === 'standings' && (
        <View className="flex-1 items-center justify-center">
           <Text className="text-white text-xl">Sedang memuat Standings...</Text>
        </View>
      )}

      {/* BOTTOM NAV (100% SVG HTML LU) */}
      {(activeView === 'matches' || activeView === 'standings') && (
        <View className="absolute bottom-0 left-0 w-full z-50 bg-kartu/95 pb-6 pt-3 border-t border-gray-800 flex-row">
          
          <TouchableOpacity 
            onPress={() => setActiveView('matches')} 
            className="flex-1 items-center gap-1"
          >
            <Svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <Path fillRule="evenodd" clipRule="evenodd" d="M24.5 11.842V20.9613C24.5 23.56 22.4107 25.6666 19.8333 25.6666H8.16667C5.58934 25.6666 3.5 23.56 3.5 20.9613V11.842C3.5 10.4292 4.12959 9.09123 5.21484 8.19759L11.0482 3.39422C12.766 1.97968 15.234 1.97968 16.9518 3.39422L22.7852 8.19759C23.8704 9.09123 24.5 10.4292 24.5 11.842ZM11.6667 20.125C11.1834 20.125 10.7917 20.5167 10.7917 21C10.7917 21.4832 11.1834 21.875 11.6667 21.875H16.3333C16.8166 21.875 17.2083 21.4832 17.2083 21C17.2083 20.5167 16.8166 20.125 16.3333 20.125H11.6667Z" fill={activeView === 'matches' ? "#FC0B12" : "#6b7280"} />
            </Svg>
            <Text className={`text-[11px] font-bold ${activeView === 'matches' ? 'text-merah' : 'text-gray-500'}`}>Jadwal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveView('standings')} 
            className="flex-1 items-center gap-1"
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M4 20H20M6 17L6 13M12 17L12 9M18 17L18 5" stroke={activeView === 'standings' ? "#FC0B12" : "#6b7280"} strokeWidth="2" strokeLinecap="round" />
              <Rect x="4" y="3" width="4" height="4" rx="1" fill={activeView === 'standings' ? "#FC0B12" : "#6b7280"} />
              <Rect x="10" y="3" width="4" height="4" rx="1" fill={activeView === 'standings' ? "#FC0B12" : "#6b7280"} />
              <Rect x="16" y="3" width="4" height="4" rx="1" fill={activeView === 'standings' ? "#FC0B12" : "#6b7280"} />
            </Svg>
            <Text className={`text-[11px] font-bold ${activeView === 'standings' ? 'text-merah' : 'text-gray-500'}`}>Klasemen</Text>
          </TouchableOpacity>

        </View>
      )}
    </SafeAreaView>
  );
}

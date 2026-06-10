import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
      <Text style={{ color: '#fff', fontSize: 24 }}>IndoScore 🔴</Text>
    </View>
  );
}

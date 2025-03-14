import { StyleSheet, Dimensions, TouchableWithoutFeedback, Animated, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';

// Ajouter dans les imports
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

// Modifier la section Portfolio pour ajouter le long press
const renderPortfolioItem = ({ item }) => (
  <TouchableWithoutFeedback 
    onLongPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedImage(item);
      setPortfolioModalVisible(true);
    }}
    delayLongPress={300}
  >
    <View style={styles.achievementItem}>
      <Image source={{ uri: item.url }} style={styles.achievementImage} />
      <LinearGradient colors={GRADIENT_OVERLAY} style={styles.achievementOverlay}>
        <AntDesign name="heart" size={16} color="#fff" />
        <Text style={styles.achievementLikes}>{item.likes}</Text>
      </LinearGradient>
    </View>
  </TouchableWithoutFeedback>
);

// Ajouter un nouveau modal pour l'affichage des photos
<Modal visible={portfolioModalVisible} transparent={true}>
  <ImageViewer
    imageUrls={portfolioImages}
    index={portfolioImages.findIndex(img => img.id === selectedImage?.id)}
    enableSwipeDown
    onSwipeDown={() => setPortfolioModalVisible(false)}
    renderHeader={() => (
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => setPortfolioModalVisible(false)}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
    )}
    renderFooter={() => (
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.modalFooter}>
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="download-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )}
  />
</Modal>

// Amélioration des Stories avec animations
const StoryCircle = ({ story, index, onPress }) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  return (
    <Pressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.storyContainer}
    >
      <Animated.View style={[styles.storyBorder, { transform: [{ scale: scaleValue }] }]}>
        <LinearGradient
          colors={GRADIENT_START}
          style={styles.storyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: story.image }} style={styles.storyImage} />
        </LinearGradient>
        {index === 0 && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </Animated.View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </Pressable>
  );
};

// Styles mis à jour
const styles = StyleSheet.create({
  // Styles existants...
  
  // Nouveaux styles
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
  },
  iconButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
  },
  storyContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
  storyGradient: {
    padding: 2,
    borderRadius: 60,
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    ...SHADOW_DEFAULT,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  storyUsername: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: DARK_COLOR,
    maxWidth: 100,
    textAlign: 'center',
  },
  portfolioImageStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 20,
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  portfolioImageStatText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
});
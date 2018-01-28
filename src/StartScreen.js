import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient'
const Sound = require('react-native-sound');
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';

const tracksImage = require('./images/tracksA.png');

const trainCarImage = require('./images/trainCar.png');
const trainFrontImage = require('./images/trainFront.png');

const trainWidth = 244;
const trainFrontWidth = 245;

Sound.setCategory('Playback');

export default class StartScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      animVal1x: new Animated.Value(0),
      animVal1y: new Animated.Value(0),
      bounceVal1ScaleX: new Animated.Value(1),
      bounceVal1ScaleY: new Animated.Value(1),
      bounceVal1y: new Animated.Value(0),
      showSteam: false,
    };
  }

  componentWillMount() {
    this.startAnimations();
    this.initSound();
  }

  initSound() {
    this.musicTrack = new Sound('trainsmission_song.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      this.playSong();
    });

    this.soundWhistle = new Sound('steam_train_whistle.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
    });
  }

  playSong() {
    // Play the sound with an onEnd callback
    this.musicTrack.play((success) => {
      if (success) {
        // do nothing
      } else {
        console.log('playback failed due to audio decoding errors');
        this.musicTrack.reset();
      }
    });

    this.musicTrack.setVolume(0.9);
    this.musicTrack.setNumberOfLoops(-1);
  }

  playWhistle() {
    if (!this.soundWhistle) {
      return;
    }
    if (this.playedOnce) {
      this.soundWhistle.stop(() => {
        this.soundWhistle.play((success) => {
          //do nothing
        });
      });
    } else {
      this.soundWhistle.play((success) => {
        //do nothing
      });
    }
    this.playedOnce = true;
  }

  onPressTrain(index, shouldPlayWhistle, shouldStartSteam) {
    this.setState({ trainBounceIndex: index })
    setTimeout(() => this.bounceTrain(index), 1);
    if (this.scrollRef) {
      this.scrollRef.scrollTo({
        x: trainWidth*Math.max((index-0.32), 0),
        y: 0,
        animated: true,
      });
    }
    if (shouldPlayWhistle) {
      this.playWhistle();
    }
    if (shouldStartSteam) {
      if (this.steamTimer) {
        clearTimeout(this.steamTimer);
      }
      this.setState({ showSteam: true });
      this.steamTimer = setTimeout(() => {
        this.steamTimer = null;
        this.setState({ showSteam: false });
      }, 2000);
    }
  }

  bounceTrain(index) {
    // animate bounce scale and translate
    Animated.sequence([
      Animated.parallel([
        Animated.timing(
          this.state.bounceVal1ScaleX,
          {
            fromValue: 1,
            toValue: 1.04,
            duration: 100,
          },
        ),
        Animated.timing(
          this.state.bounceVal1ScaleY,
          {
            fromValue: 1,
            toValue: 1.16,
            duration: 100,
          },
        ),
        Animated.timing(
          this.state.bounceVal1y,
          {
            fromValue: 0,
            toValue: -12,
            duration: 100,
          },
        ),
      ]),
      Animated.parallel([
        Animated.timing(
          this.state.bounceVal1ScaleX,
          {
            fromValue: 1.04,
            toValue: 1.0,
            duration: 150,
          },
        ),
        Animated.timing(
          this.state.bounceVal1ScaleY,
          {
            fromValue: 1.16,
            toValue: 1.0,
            duration: 150,
          },
        ),
        Animated.timing(
          this.state.bounceVal1y,
          {
            fromValue: -12,
            toValue: 0,
            duration: 100,
          },
        ),
      ]),
    ]).start();
  }

  startAnimations() {
    // animate ongoing left-right train movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(
          this.state.animVal1x,
          {
            fromValue: 0,
            toValue: 2,
            duration: 100,
          },
        ),
        Animated.timing(
          this.state.animVal1x,
          {
            fromValue: 2,
            toValue: 0,
            duration: 150,
          },
        )
      ])
    ).start();
  }

  render() {
    return this.renderTrainStartScreen();
  }

  renderTrainStartScreen() {
    return (
      <View style={styles.overallContainer}>
        <LinearGradient
          style={styles.topGradient}
          colors={['#364436','#335533']}
        />
        <Text style={styles.titleText}>{'TrainsMission'}</Text>
        {this.renderTrainTracks()}
        {this.renderTrainsCars()}
      </View>
    );
  }

  renderTrainTracks() {
    return (
      <Image
        style={styles.trainTrackImage}
        source={tracksImage}
        resizeMode={'contain'}
      />
    )
  }

  renderTrainsCars() {
    const trainInfos = [];
    let totalWidth = trainWidth * 5 + trainFrontWidth;
    const trainTexts = ['Global', 'Game', 'Jam', 'Trains', 'Mission', ''];
    let index = 0;
    for (index = 0; index < 5; index++) {
      trainInfos.push({
        left: index * trainWidth,
        index: index,
        imageSource: trainCarImage
      });
    }
    trainInfos.push({
      left: index * trainWidth,
      index: index,
      imageSource: trainFrontImage,
      shouldPlayWhistle: true,
      shouldStartSteam: true,
    });
    const scrollContainerStyle = [styles.trainScrollContent, {width: totalWidth}];

    return (
      <ScrollView
        key={'scrollCar'}
        ref={scrollRef => {
          if (this.scrollRef) return;
            this.scrollRef = scrollRef;
            setTimeout(() => this.scrollRef.scrollTo(
              {x: trainWidth*1.64, y: 0, animated: false}), 1) }}
        style={styles.trainScrollView}
        contentContainerStyle={scrollContainerStyle}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {trainInfos.map( (trainInfo) => {
          let bounceTransform = [];
          if (this.state.trainBounceIndex === trainInfo.index) {
            bounceTransform = [{
              scaleX: this.state.bounceVal1ScaleX,
            },
            {
              scaleY: this.state.bounceVal1ScaleY,
            },
            {
              translateY: this.state.bounceVal1y,
            }]
          }
          return (
            <TouchableWithoutFeedback
              key={trainInfo.index}
              onPress={() => this.onPressTrain(
                trainInfo.index,
                trainInfo.shouldPlayWhistle,
                trainInfo.shouldStartSteam)}
            >
              <Animated.View
                style={{
                  transform:[{
                    translateX: this.state.animVal1x,
                  }, ...bounceTransform]
                }}
              >
                <Image
                  style={styles.trainCarImage}
                  source={trainInfo.imageSource}
                  resizeMode={'contain'}
                />
                <Text style={styles.trainText}>
                  {trainTexts[trainInfo.index]}
                </Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          )
        })}
        {this.state.showSteam && this.renderSteam((index * trainWidth) - 100)}
      </ScrollView>
    );
  }

  renderSteam(left) {
    return (
      <View style={styles.steamRect} left={left}>
        <Text style={styles.steamText}>{'"Steam"'}</Text>
      </View>
    );

  }
}

const styles = StyleSheet.create({
  overallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 0x335533ff,
  },
  topGradient: {
    position: 'absolute',
    height: 320,
    top: 0,
    left: 0,
    right: 0,
  },
  titleText: {
    position: 'absolute',
    fontSize: 46,
    color: 0xccaa66ff,
    top: 100,
    flex: 0,
  },
  // 850 x 90, 425 x 45
  trainTrackImage: {
    position: 'absolute',
    top: 320,
    left: 0,
    right: 0,
    height: 123,
    width: 425,
  },
  trainScrollView: {
    position: 'absolute',
    top: 200,
    flex: 0,
    left: 0,
    right: 0,
    height: 200,
    //justifyContent: 'center',
  },
  trainScrollContent: {
    alignItems: 'flex-end',
  },
  //488x226, 244, 113,
  trainCarImage: {
    //top: 180,
    flex: 0,
    height: 113,
    width: 244,
    justifyContent: 'center',
  },
  trainText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 40,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 0xaa9986ff,
    bottom: 44,
    flex: 0,
  },
  steamRect: {
    position: 'absolute',
    bottom: 136,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 0xcccfccff,
    flex: 0,
    borderRadius: 16,
    borderBottomRightRadius: 0,
  },
  steamText: {
    color: 0x4444bbff,
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});

import React from "react";
import {
  Text,
  View,
  Linking,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Dimensions
} from "react-native";
import {
  Provider as PaperProvider,
  Card,
  Title,
  Paragraph,
  IconButton,
  ActivityIndicator
} from "react-native-paper";

import { NavigationStackProp } from 'react-navigation-stack';
import HTMLParser from "fast-html-parser";
const parseString = require('react-native-xml2js').parseString;

import NetInfo, { NetInfoState, NetInfoSubscription } from "@react-native-community/netinfo";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute'
  },
  offlineText: {
    color: '#fff'
  }
});



var link = "";



interface ListPageProps {
  navigation: NavigationStackProp<{}>;
  connectionInfo: NetInfoState | null;
}

export default class ListPage extends React.Component<ListPageProps> {
  _subscription: NetInfoSubscription | null = null;

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.transferParams.title, //get the title from the information which were transfered via FernsehprogrammPage
      headerTintColor: '#000',
      headerStyle: {
        backgroundColor: "#DCDCDC"
      },
      headerRight: () => (
        <IconButton
          onPress={() => navigation.navigate('ImpressumPage')}
          color="#000"
          size={25}
          icon="information"
        />
      ),
    }
  };

  state = {
    inputText: "",
    data: [],
    shortStory: "",
    storyImgUrl: "",
    isLoading: false,
    refreshing: false,
    connectionInfo: null
  };



  componentDidMount() { //is invoked immediately after a component is mounted

    link = this.props.navigation.state.params.transferParams.link; //get the title from the information which were transfered via FernsehprogrammPage
    console.log(link);

    this._subscription = NetInfo.addEventListener(
      this._handleConnectionInfoChange
    );
  }

  componentWillUnmount() {
    this._subscription && this._subscription();
  }


  _handleConnectionInfoChange = (connectionInfo: NetInfoState) => {
    this.setState({ connectionInfo });
    //console.log(connectionInfo.isConnected);
    this.setState({ connectionInfo: connectionInfo.isConnected });

    if (connectionInfo.isConnected) {
      this.setState({ isLoading: true });

      httpRequest()
        .then(response => {
          this.setState({ data: response, isLoading: false })
        })
    }
  };

  _onRefresh = () => {
    if (this.state.connectionInfo) {
      this.setState({ refreshing: true });
      httpRequest().then(() => {
        this.setState({ refreshing: false });
      });
    }
  }

  renderCardItem = ({ item }) => (
    <View style={{ paddingBottom: 16 }}>
      <CardItem
        headline={item["title"]}
        description={item["description"]}
        storyImgUrl={item.storyDetails.imgUrl}
        onCardClicked={() => Linking.openURL(item["link"][0]).catch((err) => console.error('An error occurred', err))}
      />
    </View>
  );


  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E0E0', }}>
        {!this.state.connectionInfo && <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Keine Internetverbindung</Text>
        </View>}
        <PaperProvider >
          {this.state.isLoading && <ActivityIndicator animating={true} color={"blue"} style={{ paddingTop: 50 }} />}
          {!this.state.isLoading && <View
            style={{ padding: 16 }}
          >
            <FlatList
              style={{ marginTop: 10 }}
              ListEmptyComponent={() => <Text>Keine Daten gefunden</Text>}
              data={this.state.data}
              renderItem={this.renderCardItem}
              keyExtractor={(item, index) => index.toString()}

              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }
            />

            <View style={{ height: 16 }} />

          </View>}
        </PaperProvider>
      </SafeAreaView>
    );
  }
}



interface ItemProps {
  headline: string;
  description: string;
  storyImgUrl: string,
  onCardClicked(): void;
}

class CardItem extends React.Component<ItemProps> {
  render() {
    return (
      <>
        <Card onPress={this.props.onCardClicked}>
          <Card.Content>
            <Title>{this.props.headline}</Title>
            {this.props.description != "" && <Paragraph style={{ marginBottom: 10 }}>{this.props.description}</Paragraph>}
          </Card.Content>
          {this.props.storyImgUrl != "" && <Card.Cover source={{ uri: this.props.storyImgUrl }} />}
        </Card>
      </>
    );
  }
}



function httpRequest(): Promise<any> {

  var newsArray = [];

  var fetchCounter = 0;
  var lengthOfdata = 0;


  return new Promise((resolve, reject) => {

    fetch(link)
      .then(response => response.text())
      .then((response) => {
        parseString(response, function (err, result) {
          newsArray = result.rss.channel[0].item; //newsArray
          //console.log(newsArray);
          processArray();
        });
      }).catch((err) => {
        console.log('fetch', err)
      })



    function processArray() {

      lengthOfdata = newsArray.length;

      newsArray.forEach((element, index) => {
        var url = element['link'][0];
        console.log(url)
        requestPageinformation(url, index);
      });
    }


    function requestPageinformation(pageUrl, index) { //request storyDetails for each story
      var object = { shortStory: "", imgUrl: "" };

      fetch(pageUrl)
        .then(response => response.text())
        .then((response) => {
          var root = HTMLParser.parse(response);

          try {//try to img-Url in HTML-Page
            if(root.querySelector('#videoDefaultImage') != null){
            var imageUrl = root.querySelector('#videoDefaultImage').querySelector('img').rawAttrs;
            imageUrl = imageUrl.split('"')[1];
            console.log(imageUrl);
            }else{
              var imageUrl = root.querySelector('.broadcast-detail__stage').querySelector('img').rawAttrs;
              imageUrl = imageUrl.split('"')[1];
              console.log(imageUrl);
            }
            object.imgUrl = imageUrl;


            
          } catch (e) {
            object.imgUrl = "";
          }

          console.log("Index " + index);
          newsArray[index].storyDetails = object; // add storyDetails
          fetchCounter++;

          if (lengthOfdata == fetchCounter) {
            resolve(newsArray); //resolve the array of objects to which storyDetails was added
            console.log("All data loaded!! " + newsArray.length);
          }

        }).catch((err) => {
          fetchCounter++;
          console.log('fetch', err)
          console.log(pageUrl);
          newsArray[index].storyDetails = object;
        })
    }
  });
}

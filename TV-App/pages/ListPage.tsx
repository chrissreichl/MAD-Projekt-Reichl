import React from "react";
import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Dimensions
} from "react-native";
import {
  Provider as PaperProvider,
  Card,
  Avatar,
  IconButton,
} from "react-native-paper";

import { NavigationStackProp } from 'react-navigation-stack';
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


const cardsArray = [
  {
    "cardName": "Fernsehprogramm",
    "cardSubtitle": "Die aktuellen Sendungen, Shows & Filme!",
    "icon": "television",
    "iconColor": "blue",
    "navigateToPage": "FernsehprogrammPage"
  }, {
    "cardName": "News",
    "cardSubtitle": "Hier bleiben Sie am Laufenden!",
    "icon": "newspaper",
    "iconColor": "red",
    "navigateToPage": "NewsPage",
    "transferParams": {
      "title": "News",
      "link": ["https://rss.orf.at/news.xml"]
    }
  }, {
    "cardName": "Sport",
    "cardSubtitle": "Entdecken Sie die Welt des Sports!",
    "icon": "soccer",
    "iconColor": "green",
    "navigateToPage": "NewsPage",
    "transferParams": {
      "title": "Sport",
      "link": ["https://rss.orf.at/sport.xml"]
    }
  }, {
    "cardName": "FM4",
    "cardSubtitle": "You're at home, baby!",
    "icon": "radio",
    "iconColor": "#b27300",
    "navigateToPage": "NewsPage",
    "transferParams": {
      "title": "FM4",
      "link": ["https://rss.orf.at/fm4.xml"]
    }
  }
]

const searchPageParams = {
  "title": "News-Suche",
  "link": ["https://rss.orf.at/news.xml", "https://rss.orf.at/sport.xml", "https://rss.orf.at/fm4.xml"]
}


interface ListPageProps {
  navigation: NavigationStackProp<{}>;
  connectionInfo: NetInfoState | null;
}





export default class ListPage extends React.Component<ListPageProps> {
  _subscription: NetInfoSubscription | null = null;

  static navigationOptions = ({ navigation }) => {
    return {
      title: "InfoPoint",
      headerTintColor: '#000',
      headerStyle: {
        backgroundColor: "#DCDCDC"
      },
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <IconButton //Search Icon
            onPress={() => navigation.navigate('NewsPage', { transferParams: searchPageParams })}
            color="#000"
            size={25}
            icon="magnify"
          />
          <IconButton
            onPress={() => navigation.navigate('ImpressumPage')}
            color="#000"
            size={25}
            icon="information"
          />
        </View>
      ),
    }
  };

  state = {
    data: cardsArray,
    connectionInfo: null
  };


  componentDidMount() {
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
  };




  renderCardItem = ({ item }) => (
    <View style={{ paddingBottom: 16 }}>
      <CardItem
        name={item.cardName}
        subtitel={item.cardSubtitle}
        icon={item.icon}
        iconColor={item.iconColor}
        onCardClicked={() => this.props.navigation.navigate(item.navigateToPage, { transferParams: item["transferParams"] })}
      />
    </View>
  );


  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E0E0', }}>
        {!this.state.connectionInfo && <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Keine Internetverbindung</Text>
        </View>}
        <PaperProvider>
          <View
            style={{ padding: 16, marginTop: 10 }}
          >
            <FlatList
              ListEmptyComponent={() => <Text>Keine Daten gefunden</Text>}
              data={this.state.data}
              renderItem={this.renderCardItem}
              keyExtractor={(item, index) => index.toString()}
            />

            <View style={{ height: 16 }} />

          </View>
        </PaperProvider>
      </SafeAreaView>
    );
  }





}



interface ItemProps {
  name: string;
  subtitel: string;
  icon: string;
  iconColor: string;
  onCardClicked(): void;
}

class CardItem extends React.Component<ItemProps> {
  render() {
    return (
      <>
        <Card onPress={this.props.onCardClicked}>
          <Card.Title
            title={this.props.name}
            subtitle={this.props.subtitel}
            left={props => <Avatar.Icon {...props} icon={this.props.icon} style={[{ backgroundColor: this.props.iconColor },
            ]} />}
          />
        </Card>
      </>
    );
  }
}



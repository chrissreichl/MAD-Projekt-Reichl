//these pages get information from the listpage of cardsarray -> transferParams or from searchPageParams
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
    Searchbar,
    ActivityIndicator
} from "react-native-paper";

import { NavigationStackProp } from 'react-navigation-stack';
import HTMLParser from "fast-html-parser";

import NetInfo, { NetInfoState, NetInfoSubscription } from "@react-native-community/netinfo";

const parseString = require('react-native-xml2js').parseString;

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width,
        position: 'absolute',
    },
    offlineText: {
        color: '#fff'
    }
});

var URLArray = [];


interface ListPageProps {
    navigation: NavigationStackProp<{}>;
    connectionInfo: NetInfoState | null;
}

export default class ListPage extends React.Component<ListPageProps> {
    _subscription: NetInfoSubscription | null = null;

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.transferParams.title, //get the title from the information which were transfered via FernsehprogrammPage,
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
        isLoadingNews: false,
        refreshing: false,
        connectionInfo: null
    };



    componentDidMount() { //is invoked immediately after a component is mounted

        URLArray = this.props.navigation.state.params.transferParams.link; //get the title from the information which were transfered via FernsehprogrammPage
        console.log(URLArray);

        this._subscription = NetInfo.addEventListener(
            this._handleConnectionInfoChange
        );


    }

    componentWillUnmount() {
        this._subscription && this._subscription();
    }



    _handleConnectionInfoChange = (connectionInfo: NetInfoState) => {
        this.setState({ connectionInfo });
        console.log(connectionInfo.isConnected);
        this.setState({ connectionInfo: connectionInfo.isConnected });

        if (connectionInfo.isConnected) {
            this.setState({ isLoadingNews: true });

            httpRequest()
                .then(response => {
                    this.setState({ data: response, isLoadingNews: false })
                })
        }
    };


    getFilteredItems = () =>
        this.state.data.filter(
            value =>
                value.storyDetails.shortStory.toLowerCase().includes(this.state.inputText.toLowerCase()) ||
                value["title"][0].toLowerCase().includes(this.state.inputText.toLowerCase()) ||
                value["dc:subject"][0].toLowerCase().includes(this.state.inputText.toLowerCase())
        );


    _onRefresh = () => {
        //console.log(this.state.connectionInfo);
        if (this.state.connectionInfo) {
            this.setState({ refreshing: true });
            httpRequest().then(() => {

                this.setState({ refreshing: false });
            });
        }
    }

    renderCardItem = ({ item }) => ( //create and filling the carditem (blueprint) with data

        <View style={{ paddingBottom: 16 }}>
            <CardItem
                headline={item["title"]}
                subject={item["dc:subject"][0]}
                dateInfo={converteDate(item["dc:date"][0])}
                shortStory={item.storyDetails.shortStory}
                storyImgUrl={item.storyDetails.imgUrl}
                onCardClicked={() => Linking.openURL(item["link"][0]).catch((err) => console.error('An error occurred', err))}
            />
        </View>
    );


    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E0E0' }}>
                {!this.state.connectionInfo && <View style={styles.offlineContainer}>
                    <Text style={styles.offlineText}>Keine Internetverbindung</Text>
                </View>}
                <PaperProvider>
                    {this.state.isLoadingNews && <ActivityIndicator animating={true} color={"blue"} style={{ paddingTop: 50 }} />}
                    {!this.state.isLoadingNews && <View
                        style={{ padding: 16 }}
                    >

                        <View style={{ paddingBottom: 15, elevation: 15, marginTop: 10 }}>
                            <Searchbar
                                placeholder="Suche"
                                onChangeText={query => this.setState({ inputText: query })}
                                value={this.state.inputText}
                            />
                        </View>

                        <FlatList
                            style={{ marginBottom: 65 }}
                            ListEmptyComponent={() => <Text>Keine Newsbeiträge gefunden</Text>}
                            data={this.getFilteredItems()}
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
    dateInfo: string;
    subject: string;
    shortStory: any;
    storyImgUrl: string,
    onCardClicked(): void;
}

class CardItem extends React.Component<ItemProps> { //blueprint of a card
    render() {
        return (
            <>
                <Card onPress={this.props.onCardClicked}>
                    <Card.Content>
                        <Paragraph>{this.props.subject + " | " + this.props.dateInfo}</Paragraph>
                        <Title>{this.props.headline}</Title>
                        <Paragraph style={{ marginBottom: 10 }}>{this.props.shortStory}</Paragraph>
                    </Card.Content>
                    {this.props.storyImgUrl != "" && <Card.Cover source={{ uri: this.props.storyImgUrl }} />}
                </Card>
            </>
        );
    }
}


function converteDate(dateString) {
    var newsDateArray = dateString.split("T")[0].split("-");
    var newsTimeArray = dateString.split("T")[1].split("+");
    var newsDate = newsDateArray[2] + "." + newsDateArray[1] + "." + newsDateArray[0];
    var newsTimeHoursMinutes = newsTimeArray[0].split(":");
    newsTimeHoursMinutes = newsTimeHoursMinutes[0] + ":" + newsTimeHoursMinutes[1];
    // currentDate
    var currentDateRequest = new Date();
    var currentDay = ("0" + currentDateRequest.getDate()).slice(-2); //.slice(-2) makes 029 to 29  || "0" is important because .getDate gives 1 instead of 01 back  
    var currentMonth = ("0" + (currentDateRequest.getMonth() + 1)).slice(-2); // +1 is important, because currentDateRequest.getMonth() = 0 for the january 
    var currentYear = currentDateRequest.getFullYear();
    var currentDate = currentDay + "." + currentMonth + "." + currentYear;

    if (newsDate == currentDate) {
        newsDate = "heute";
    }
    newsDate = "Online seit " + newsDate + ", " + newsTimeHoursMinutes;
    return newsDate;
}


function httpRequest(): Promise<any> {

    var newsArray = [];

    var fetchCounter = 0;
    var fetchXmlCounter = 0;
    var lengthOfdata = 0;


    return new Promise((resolve, reject) => {

        URLArray.forEach((element) => {
            //console.log(element);
            fetch(element)
                .then(response => response.text())
                .then((response) => {
                    parseString(response, function (err, result) {
                        newsArray = newsArray.concat(result["rdf:RDF"]["item"]);
                        fetchXmlCounter++;
                        processNewsArray();
                    });
                }).catch((err) => {
                    console.log('fetch', err)
                })
        });


        function processNewsArray() {
            if (fetchXmlCounter == URLArray.length) {

                lengthOfdata = newsArray.length;

                newsArray.forEach((element, index) => {
                    var url = element['$']['rdf:about'];
                    console.log(url)
                    requestPageinformation(url, index);
                });
            }
        }


        function requestPageinformation(pageUrl, index) { //request storyDetails for each story
            var object = { shortStory: "", imgUrl: "" };

            fetch(pageUrl)
                .then(response => response.text())
                .then((response) => {
                    var root = HTMLParser.parse(response);
                   

                    try {//try to find shortStory in HTML-Page
                        if (root.querySelector('.story-lead-text') != null) { //orf News und Sport
                            var shortStory = root.querySelector('.story-lead-text').text.trim(); //.trim() is needed, because in the string before the characters are unnecessary spaces 
                        } else if (root.querySelector('.story-story') != null) {
                            var shortStory = root.querySelector('.story-story').querySelector('p').rawText;
                        } else {
                            var shortStory = root.querySelector('.teaser').text; //FM4
                        }
                        object.shortStory = shortStory;
                    } catch (e) {
                        object.shortStory = "";
                    }

                    try {//try to img-Url in HTML-Page
                        if (root.querySelector('.opener') != null) {
                            var imageUrl = root.querySelector('.image').querySelector('img').rawAttrs;
                            imageUrl = imageUrl.split('"')[1];
                        }
                        else {
                            var imageUrl = root.querySelector('.story-story').querySelector('figure').querySelector('img').rawAttrs; //search the img - url in the html-file
                            imageUrl = imageUrl.split("data-src=")[1].split("data-srcset=")[0].replace('"', ''); //split the url from the rest of the string    
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

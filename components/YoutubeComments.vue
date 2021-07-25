<template>
    <v-container
        id="input-usage"
        fluid
        >
        <v-row>
            <v-card
                flat
                color="transparent"
                >
                <v-card-text>
                    <v-row>
                        <div>
                            Get "Video ID" from URL<br/>
                            https://www.youtube.com/watch?v=<b>{Video ID}</b>
                        </div>
                    </v-row>
                    <v-row>
                        <v-col class="px-4">
                            <v-text-field
                                v-model="videoId"
                                :disabled="chatId !== ''"
                                label="Video ID"
                                required
                                >
                            </v-text-field>
                        </v-col>
                        <v-col class="px-4">
                            <v-btn
                                :disabled="videoId === '' || chatId !== ''"
                                color="success"
                                class="mr-4"
                                @click="onSearchVideo"
                                >
                                get video detail
                            </v-btn>
                        </v-col>
                        <v-col class="px-4">
                            <v-btn
                                :disabled="chatId === ''"
                                color="success"
                                class="mr-4"
                                @click="onReset"
                                >
                                reset
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="px-4">
                            <div v-if="video !== null">
                                <div>Video ID: {{ videoId }}</div>
                                <div><a :href="'https://www.youtube.com/watch?v=' + videoId">https://www.youtube.com/watch?v={{ videoId }}</a></div>
                                <div>Channel: {{ video.snippet.channelTitle }}</div>
                                <div>
                                    {{ video.snippet.title }}
                                    <v-img
                                        :src="video.snippet.thumbnails.standard.url"
                                         max-width="250"
                                        ></v-img>
                                </div>
                                <div>Chat ID: {{ chatId }}</div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-row>
        <v-row>
            <v-card
                flat
                color="transparent"
                >
                <v-card-text>
                    <v-row>
                        <v-col class="px-4">
                            Interval seconds
                            <v-text-field
                                v-model="intervalSec"
                                label="interval second"
                                :disabled="isPolling || chatId === ''"
                                :max="300"
                                :min="10"
                                hide-details
                                single-line
                                type="number"
                                required
                                >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="px-4">
                            <v-btn
                                :disabled="isPolling || chatId === ''"
                                color="primary"
                                class="mr-4"
                                @click="onStartLiveChat"
                                >
                                start polling messages
                            </v-btn>
                        </v-col>
                        <v-col class="px-4">
                            <v-btn
                                :disabled="!isPolling"
                                color="success"
                                class="mr-4"
                                @click="onStopLiveChat"
                                >
                                pause polling messages
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-row>
        <v-row>
            <v-col class="px-12">
                <v-tabs
                    v-model="tabChats"
                    >
                    <v-tab key="all">All</v-tab>
                    <v-tab key="superchat">Superchats</v-tab>
                </v-tabs>
                <v-tabs-items
                    v-model="tabChats"
                    >
                    <v-tab-item key="all">
                        <v-simple-table dense>
                            <template #default>
                                <thead>
                                    <tr>
                                        <th class="text-left">Datetime</th>
                                        <th class="text-left">Icon</th>
                                        <th class="text-left">Author</th>
                                        <th class="text-left">Message</th>
                                        <th class="text-left">Message type</th>
                                        <th class="text-left">Tip</th>
                                        <th class="text-left">Tier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="item in chatMessages"
                                        :key="item.id"
                                        >
                                        <td>{{ item.snippet.publishedAt }}</td>
                                        <td><v-img :src="item.authorDetails.profileImageUrl"></v-img></td>
                                        <td>{{ item.authorDetails.displayName }}</td>
                                        <td>{{ item.snippet.displayMessage }}</td>
                                        <td>{{ item.snippet.type }}</td>
                                        <td>{{ (item.snippet.superChatDetails) ? item.snippet.superChatDetails.amountDisplayString : "" }}</td>
                                        <td>{{ (item.snippet.superChatDetails) ? item.snippet.superChatDetails.tier : "" }}</td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-tab-item>
                    <v-tab-item key="superchat">
                        <v-simple-table dense>
                            <template #default>
                                <thead>
                                    <tr>
                                        <th class="text-left">Datetime</th>
                                        <th class="text-left">Icon</th>
                                        <th class="text-left">Author</th>
                                        <th class="text-left">Message</th>
                                        <th class="text-left">Message type</th>
                                        <th class="text-left">Tip</th>
                                        <th class="text-left">Tier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="item in superchatMessages"
                                        :key="item.id"
                                        >
                                        <td>{{ item.snippet.publishedAt }}</td>
                                        <td><v-img :src="item.authorDetails.profileImageUrl"></v-img></td>
                                        <td>{{ item.authorDetails.displayName }}</td>
                                        <td>{{ item.snippet.displayMessage }}</td>
                                        <td>{{ item.snippet.type }}</td>
                                        <td>{{ (item.snippet.superChatDetails) ? item.snippet.superChatDetails.amountDisplayString : "" }}</td>
                                        <td>{{ (item.snippet.superChatDetails) ? item.snippet.superChatDetails.tier : "" }}</td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'

interface ChatData {
    videoId: string;
    chatId: string;
    video: any|null;
    chatMessages: any[];
    superchatMessages:  any[];
    chatNextToken: string;
    poller: any;
    isPolling: boolean;
    intervalSec: number;
    tabChats: any|null;
}

export default Vue.extend({
    name: 'YoutubeComments',
    data(): ChatData {
        return {
            videoId: "",
            chatId: "",
            video: null,
            chatMessages: [],
            superchatMessages: [],
            chatNextToken: "",
            poller: undefined,
            isPolling: false,
            intervalSec: 30,
            tabChats: null,
        }
    },
    mounted() {
        this.chatMessages = []
        this.superchatMessages = []
        this.$gapi.getGapiClient().then((gapi) => {
            console.log(gapi)
        })
    },
    beforeDestroy () {
        console.log('destroy')
        this.onReset()
    },
    methods: {
        getChatMessages() {
            console.log("getChatMessages")
            this.getLiveChats(this.chatId, this.chatNextToken).then((res: any) => {
                const messages: string[] = res[0]
                const nextToken: string = res[1]
                console.log(messages, nextToken)
                this.chatNextToken = nextToken
                this.chatMessages = this.chatMessages.concat(messages)

                const superchatTypes: string[] = ["superChatEvent", "superStickerEvent"]
                const superchatMessages = messages.filter((chat: any) => {
                    return superchatTypes.includes(chat.snippet.type)
                });
                this.superchatMessages = this.superchatMessages.concat(superchatMessages)

                this.chatMessages.sort((first: any, second: any) => {
                    if( first.snippet.publishedAt > second.snippet.publishedAt ) return -1;
                    if( first.snippet.publishedAt < second.snippet.publishedAt ) return 1;
                    return 0;
                })
                this.superchatMessages.sort((first, second) => {
                    if( first.snippet.publishedAt > second.snippet.publishedAt ) return -1;
                    if( first.snippet.publishedAt < second.snippet.publishedAt ) return 1;
                    return 0;
                })
            }).catch((err: any) => {
                console.log(err)
            });
        },
        getVideo(videoId: string): Promise<any> {
            return new Promise((resolve: any, reject: any) => {
                this.$gapi.getGapiClient().then((gapi) => {
                    gapi.client.youtube.videos.list({
                        id: videoId,
                        part: 'snippet,liveStreamingDetails',
                    }).execute((response: any) => {
                        console.log(response)
                        if (response.items.length !== 1) {
                            reject(new Error("error"));
                        } else {
                            const video = response.items[0]
                            resolve(video);
                        }
                    });
                });
            });
        },
        getLiveChats(chatId: string, nextToken: string): Promise<any> {
            return new Promise((resolve, reject) => {
                this.$gapi.getGapiClient().then((gapi: any) => {
                    gapi.client.youtube.liveChatMessages.list({
                        liveChatId: chatId,
                        part: 'id,snippet,authorDetails',
                        maxResults: 2000,
                        pageToken: nextToken,
                    }).execute((response: any) => {
                        console.log(response)
                        const messages: any[] = response.items;
                        resolve([messages, response.nextPageToken]);
                    });
                }).catch((err: any) => {
                    reject(err);
                });
            });
        },
        onSearchVideo() {
            console.log("onSearchChatId")
            this.getVideo(this.videoId).then((video: any) => {
                this.video = video
                if (video.snippet.liveBroadcastContent !== "live") {
                    console.log("not live")
                } else {
                    const chatId: string = video.liveStreamingDetails.activeLiveChatId;
                    this.chatId = chatId
                }
            }).catch((err: any) => {
                console.log(err)
            });
        },
        onStartLiveChat() {
            const self = this;
            const interval: number = Number(this.intervalSec) * 1000;
            console.log(this.intervalSec);
            console.log(interval);
            this.getChatMessages();
            this.poller = setInterval(() => {
                self.getChatMessages();
            }, interval);
            this.isPolling = true;
        },
        onStopLiveChat() {
            clearInterval(this.poller);
            this.poller = undefined;
            this.isPolling = false;
        },
        onReset() {
            this.onStopLiveChat()
            this.chatNextToken = "";
            this.videoId = '';
            this.chatId = '';
            this.chatMessages = []
            this.superchatMessages = []
            this.video = null
        },
    }
})
</script>

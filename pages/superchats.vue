<template>
    <v-container id="input-usage" class="pa-2" fluid>
        <v-row>
            <v-col v-show="false" cols="1">
                <v-btn class="md-1" color="primary" @click="isShowTab = !isShowTab">
                    tabs
                </v-btn>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-expand-transition>
                    <v-tabs v-model="tab" background-color="primary" v-show="isShowTab">
                        <v-tab>Setting</v-tab>
                        <v-tab>Chats</v-tab>
                    </v-tabs>
                </v-expand-transition>
                <v-tabs-items v-model="tab">
                    <v-tab-item>
                        <v-card v-if="video === null">
                            <v-card-subtitle>
                                Get URL "https://www.youtube.com/watch?v={Video ID}"
                            </v-card-subtitle>
                            <v-card-text>
                                <v-row no-gutters>
                                    <v-col>
                                        <v-text-field v-model="videoUrl" label="Video URL" required></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-btn :disabled="videoUrl === ''" color="success" @click="onSearchVideo">
                                            get video detail
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                        <v-card v-else>
                            <v-card-text>
                                <v-row no-gutters>
                                    <v-col cols="10">
                                        <div><a :href="videoUrl">{{ videoUrl }}</a></div>
                                        <div><b>Channel:</b> {{ video.snippet.channelTitle }}</div>
                                        <div>
                                            <b>Video:</b> {{ video.snippet.title }}
                                            <v-img
                                                :src="video.snippet.thumbnails.standard.url"
                                                max-width="250"
                                                ></v-img>
                                        </div>
                                        <div><b>Video ID:</b> {{ videoId }}</div>
                                        <div><b>Chat ID:</b> {{ chatId }}</div>
                                    </v-col>
                                </v-row>
                                <v-row no-gutters>
                                    <v-col cols="">
                                        <v-btn color="success" @click="onReset">reset</v-btn>
                                        <v-btn v-if="!isPollingLiveChats" color="success" @click="onStartPolling">Start polling</v-btn>
                                        <v-btn v-else color="success" @click="onPausePolling">Pause polling</v-btn>
                                    </v-col>
                                    <v-spacer></v-spacer>
                                </v-row>
                                <v-row no-gutters>
                                    <v-col cols="2">
                                        <v-text-field
                                            :disabled="isPollingLiveChats"
                                            v-model="intervalSec"
                                            label="interval second"
                                            :max="300"
                                            :min="10"
                                            type="number"
                                            required
                                            ></v-text-field>
                                    </v-col>
                                    <v-spacer></v-spacer>
                                </v-row>
                                <v-row no-gutters>
                                    <v-col cols="12">
                                        <v-data-table
                                            dense
                                            disable-sort
                                            :items-per-page="20"
                                            :headers="chatHeaders"
                                            :items="chatMessages"
                                            :footer-props="{
                                                itemsPerPageOptions: [20, 50, 100, -1]
                                            }"
                                            class="elevation-1"
                                            >
                                            <template v-slot:item.authorDetails.profileImageUrl="{ item }">
                                                <v-img :src="item.authorDetails.profileImageUrl" height="40" :contain="true"></v-img>
                                            </template>
                                            <template v-slot:item.snippet.displayMessage="{ item }">
                                                <div v-if="item.snippet.superChatDetails">{{ item.snippet.superChatDetails.userComment }}</div>
                                                <div v-else-if="item.snippet.superStickerDetails">{{ item.snippet.superStickerDetails.superStickerMetadata.altText }}</div>
                                                <div v-else-if="item.snippet.textMessageDetails">{{ item.snippet.textMessageDetails.messageText }}</div>
                                                <div v-else>{{ item.snippet.displayMessage }}</div>
                                            </template>
                                            <template v-slot:item.snippet.superChatDetails.amountDisplayString="{ item }">
                                                <div v-if="item.snippet.superChatDetails">
                                                    <v-chip
                                                        :color="getSuperChatTierColor(item.snippet.superChatDetails.tier)"
                                                        text-color="white"
                                                        >
                                                        {{ item.snippet.superChatDetails.amountDisplayString }}
                                                    </v-chip>
                                                </div>
                                                <div v-else-if="item.snippet.superStickerDetails">
                                                    <v-chip
                                                        :color="getSuperChatTierColor(item.snippet.superStickerDetails.tier)"
                                                        text-color="white"
                                                        >
                                                        {{ item.snippet.superStickerDetails.amountDisplayString }}
                                                    </v-chip>
                                                </div>
                                            </template>
                                            <template v-slot:item.snippet.superChatDetails.tier="{ item }">
                                                <div v-if="item.snippet.superChatDetails">{{ item.snippet.superChatDetails.tier }}</div>
                                                <div v-else-if="item.snippet.superStickerDetails">{{ item.snippet.superStickerDetails.tier }}</div>
                                            </template>
                                        </v-data-table>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        aaa
                        <v-list-item>
                        </v-list-item>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { YoutubeChatsStore } from '~/store'

export default Vue.extend({
    name: 'Superchats',
    layout (context) {
        return "white"
    },
    data() {
        return {
            videoUrl: "",
            chatHeaders: [
                { text: "datetime", value: "snippet.publishedAt" },
                { text: "author icon", value: "authorDetails.profileImageUrl" },
                { text: "author name", value: "authorDetails.displayName" },
                { text: "message", value: "snippet.displayMessage" },
                { text: "message type", value: "snippet.type" },
                { text: "amunt", value: "snippet.superChatDetails.amountDisplayString" },
                { text: "tier", value: "snippet.superChatDetails.tier" },
            ],
            superchatMessages: [],
            intervalSec: 30,
            tab: null,
            isShowTab: false,
        }
    },
    mounted() {
    },
    methods: {
        getSuperChatTierColor(tier: number): string {
            let color: string
            switch(tier) {
                case 1:
                    color = "#0D47A1"
                    break
                case 2:
                    color = "#03A9F4"
                    break
                case 3:
                    color = "#00E676"
                    break
                case 4:
                    color = "#FBC02D"
                    break
                case 5:
                    color = "#FF5722"
                    break
                case 6:
                    color = "#D81B60"
                    break
                default:
                    color = "#F44336"
            }
            return color
        },
        onSearchVideo() {
            console.log("onSearchVideo")
            YoutubeChatsStore.fetchVideo(this.videoUrl)
        },
        onReset() {
            console.log("onReset")
            YoutubeChatsStore.reset()
        },
        onStartPolling() {
            console.log("onStartPolling")
            YoutubeChatsStore.startPollingLiveChats(this.intervalSec)
        },
        onPausePolling() {
            console.log("onPausePolling")
            YoutubeChatsStore.pausePollingLiveChats()
        },
    },
    computed: {
        videoId() {
            return YoutubeChatsStore.getVideoId;
        },
        video() {
            return YoutubeChatsStore.getVideo;
        },
        chatId() {
            return YoutubeChatsStore.getChatId;
        },
        chatMessages() {
            return YoutubeChatsStore.getChatMessages;
        },
        isPollingLiveChats() {
            return YoutubeChatsStore.getIsPollingLiveChats;
        },
    },
    watch: {
        video(value, oldValue) {
            console.log("updated");
            console.log(value);
        },
    }
})
</script>

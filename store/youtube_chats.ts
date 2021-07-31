import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import Vue from 'vue'
import VueGapi from 'vue-gapi'

@Module({
  name: 'youtube_chats',
  stateFactory: true,
  namespaced: true,
})
export default class YoutubeChats extends VuexModule {
    private videoUrl: string = ""
    private video: any|null = null
    private liveChatNextToken: string|null = null
    private chatMessages: any[] = []
    private superchatMessages: any[] = []
    private isPolling: boolean = false
    private poller: any = undefined

    public get getVideoId(): string {
        console.log(this.videoUrl)
        if (this.videoUrl === "") {
            return ""
        }
        let index: number;
        index = this.videoUrl.indexOf("=");
        return this.videoUrl.slice(index + 1, index + 12)
    }

    public get getVideo(): any|null {
        return this.video
    }

    public get getChatId(): string {
        if (this.getVideo === null) {
            return ""
        }
        if (this.getVideo.snippet.liveBroadcastContent !== "live") {
            console.log("not live")
            return ""
        } else {
            return this.getVideo.liveStreamingDetails.activeLiveChatId;
        }
    }

    public get getLiveChatNextToken(): any|null {
        return this.liveChatNextToken
    }

    public get getChatMessages(): any[] {
        return this.chatMessages
    }

    public get getSuperchatMessages(): any[] {
        return this.superchatMessages
    }

    public get getIsPollingLiveChats(): boolean {
        return this.isPolling
    }

    @Mutation
    private setVideoUrl(videoUrl: string) {
        this.videoUrl = videoUrl
    }

    @Mutation
    private setVideo(video: any|null) {
        this.video = video
    }

    @Mutation
    private setLiveChatNextToken(next_token: string|null) {
        this.liveChatNextToken = next_token
    }

    @Mutation
    private setChatMessages(chats: any[]) {
        this.chatMessages = chats
    }

    @Mutation
    private setSuperchatMessages(chats: any[]) {
        this.superchatMessages = chats
    }

    @Mutation
    private setIsPollingLiveChats(isPolling: boolean) {
        this.isPolling = isPolling
    }

    @Mutation
    private updateChatMessages(chats: any[]) {
        this.chatMessages = this.chatMessages.concat(chats)

        const superchatTypes: string[] = ["superChatEvent", "superStickerEvent"]
        const superchatMessages = chats.filter((chat: any) => {
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
    }

    @Action({ rawError: true })
    public async fetchVideo(videoUrl: string) {
        await this.setVideoUrl(videoUrl)
        Vue.prototype.$gapi.getGapiClient().then((gapi: any) => {
            gapi.client.youtube.videos.list({
                id: this.getVideoId,
                part: 'snippet,liveStreamingDetails',
            }).execute((response: any) => {
                if (response.items.length !== 1) {
                    throw new Error("not found");
                } else {
                    const video = response.items[0]
                    this.setVideo(video);
                }
            });
        });
    }

    @Action({ rawError: true })
    public async fetchLiveChats() {
        Vue.prototype.$gapi.getGapiClient().then((gapi: any) => {
            gapi.client.youtube.liveChatMessages.list({
                liveChatId: this.getChatId,
                part: 'id,snippet,authorDetails',
                maxResults: 2000,
                pageToken: this.getLiveChatNextToken,
            }).execute((response: any) => {
                const messages: any[] = response.items;
                this.setLiveChatNextToken(response.nextPageToken)
                this.updateChatMessages(messages)
            });
        }).catch((err: any) => {
            throw err;
        });
    }

    @Action({ rawError: true })
    public async startPollingLiveChats(intervalSec: number) {
        if (this.isPolling || this.poller) {
            return
        }
        const interval: number = Number(intervalSec) * 1000;
        this.fetchLiveChats();
        const self = this;
        this.poller = setInterval(() => {
            self.fetchLiveChats();
        }, interval);
        this.setIsPollingLiveChats(true);
    }

    @Action({ rawError: true })
    public async pausePollingLiveChats() {
        if (!this.isPolling && !this.poller) {
            return
        }
        clearInterval(this.poller);
        this.poller = undefined;
        this.setIsPollingLiveChats(false);
    }

    @Action({ rawError: true })
    public async reset() {
        this.setVideoUrl("")
        this.setVideo(null)
        this.setLiveChatNextToken(null)
        this.setChatMessages([])
        this.setSuperchatMessages([])
        this.pausePollingLiveChats()
    }

}

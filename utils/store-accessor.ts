import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import YoutubeChats from '~/store/youtube_chats'

let YoutubeChatsStore: YoutubeChats

function initialiseStores(store: Store<any>): void {
  YoutubeChatsStore = getModule(YoutubeChats, store)
}

export { initialiseStores, YoutubeChatsStore }

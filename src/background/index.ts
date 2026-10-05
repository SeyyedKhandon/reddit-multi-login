// Reddit's web login is cookie based. An "account" here is a snapshot of all
// reddit.com cookies; switching = wipe current cookies, restore the snapshot.
import { onMessage } from "./router";

chrome.runtime.onMessage.addListener(onMessage);

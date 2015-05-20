*
/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 
 *Funktioner:
 *Message of the day
 *Random fact om osss var 13 låt
 *Fuck you smiley?
 *Show string "you have misbehaved *slaps* when mute." 


*/


(function () {

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(snusBot.room.autodisableInterval);
        clearInterval(snusBot.room.afkInterval);
        snusBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("snusBotsettings", JSON.stringify(snusBot.settings));
        localStorage.setItem("snusBotRoom", JSON.stringify(snusBot.room));
        var snusBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: snusBot.version
        };
        localStorage.setItem("snusBotStorageInfo", JSON.stringify(snusBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Kryptonkakan/basicBot/master/lang/langIndex.json", function (json) {
            var link = snusBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[snusBot.settings.language.toLowerCase()];
                if (snusBot.settings.chatLink !== snusBot.chatLink) {
                    link = snusBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = snusBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        snusBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(snusBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        snusBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("snusBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                snusBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("snusBotStorageInfo");
        if (info === null) API.chatLog(snusBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("snusBotsettings"));
            var room = JSON.parse(localStorage.getItem("snusBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(snusBot.chat.retrievingdata);
                for (var prop in settings) {
                    snusBot.settings[prop] = settings[prop];
                }
                snusBot.room.users = room.users;
                snusBot.room.afkList = room.afkList;
                snusBot.room.historyList = room.historyList;
                snusBot.room.mutedUsers = room.mutedUsers;
                snusBot.room.autoskip = room.autoskip;
                snusBot.room.roomstats = room.roomstats;
                snusBot.room.messages = room.messages;
                snusBot.room.queue = room.queue;
                snusBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(snusBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@snusBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        snusBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var botCreator = "Matthew (Yemasthui)";
    var botMaintainer = "Benzi (Quoona)"
    var botCreatorIDs = ["3851534", "4105209"];

    var snusBot = {
        version: "1.0",
        status: false,
        name: "Snus Bot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Kryptonkakan/basicBot/master/snusBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/Kryptonkakan/basicBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Snus Bot",
            language: "english",
            chatLink: "https://rawgit.com/Kryptonkakan/basicBot/master/lang/en.json",
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            lockskipPosition: 3,
            lockskipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: "Thess är sexig på röntgen bilder",
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Kryptonkakan/basicBot-customization/master/blacklists/ExampleNSFWlist.json",
                OP: "https://rawgit.com/Kryptonkakan/basicBot-customization/master/blacklists/ExampleOPlist.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (snusBot.status && snusBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    snusBot.room.roulette.rouletteStatus = true;
                    snusBot.room.roulette.countdown = setTimeout(function () {
                        snusBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(snusBot.chat.isopen);
                },
                endRoulette: function () {
                    snusBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * snusBot.room.roulette.participants.length);
                    var winner = snusBot.room.roulette.participants[ind];
                    snusBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = snusBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(snusBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        snusBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = snusBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < snusBot.room.users.length; i++) {
                    if (snusBot.room.users[i].id === id) {
                        return snusBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < snusBot.room.users.length; i++) {
                    var match = snusBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return snusBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = snusBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = snusBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < snusBot.room.queue.id.length; i++) {
                            if (snusBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            snusBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(snusBot.chat.alreadyadding, {position: snusBot.room.queue.position[alreadyQueued]}));
                        }
                        snusBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            snusBot.room.queue.id.unshift(id);
                            snusBot.room.queue.position.unshift(pos);
                        }
                        else {
                            snusBot.room.queue.id.push(id);
                            snusBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(snusBot.chat.adding, {name: name, position: snusBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = snusBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return snusBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(snusBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return snusBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (snusBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = snusBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(snusBot.chat.toolongago, {name: snusBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = snusBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = snusBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(snusBot.chat.valid, {name: snusBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                snusBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!snusBot.roomUtilities.booth.locked);
                    snusBot.roomUtilities.booth.locked = false;
                    if (snusBot.settings.lockGuard) {
                        snusBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(snusBot.roomUtilities.booth.locked);
                        }, snusBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(snusBot.roomUtilities.booth.locked);
                    clearTimeout(snusBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!snusBot.status || !snusBot.settings.afkRemoval) return void (0);
                var rank = snusBot.roomUtilities.rankToNumber(snusBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, snusBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = snusBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = snusBot.userUtilities.getUser(user);
                            if (rank !== null && snusBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = snusBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = snusBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > snusBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(snusBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(snusBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            snusBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(snusBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: snusBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (snusBot.settings.cycleGuard) {
                        snusBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, snusBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(snusBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (snusBot.settings.motdEnabled) interval = snusBot.settings.motdInterval;
                else interval = snusBot.settings.messageInterval;
                if ((snusBot.room.roomstats.songCount % interval) === 0 && snusBot.status) {
                    var msg;
                    if (snusBot.settings.motdEnabled) {
                        msg = snusBot.settings.motd;
                    }
                    else {
                        if (snusBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = snusBot.room.roomstats.songCount % snusBot.settings.intervalMessages.length;
                        msg = snusBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in snusBot.settings.blacklists) {
                    snusBot.room.blacklists[bl] = [];
                    if (typeof snusBot.settings.blacklists[bl] === 'function') {
                        snusBot.room.blacklists[bl] = snusBot.settings.blacklists();
                    }
                    else if (typeof snusBot.settings.blacklists[bl] === 'string') {
                        if (snusBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(snusBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    snusBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(snusBot.room.newBlacklisted);
                }
                else {
                    console.log(snusBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < snusBot.room.newBlacklisted.length; i++) {
                    var track = snusBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = chat.message.trim();
            for (var i = 0; i < snusBot.room.users.length; i++) {
                if (snusBot.room.users[i].id === chat.uid) {
                    snusBot.userUtilities.setLastActivity(snusBot.room.users[i]);
                    if (snusBot.room.users[i].username !== chat.un) {
                        snusBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (snusBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!snusBot.chatUtilities.commandCheck(chat))
                snusBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < snusBot.room.users.length; i++) {
                if (snusBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                snusBot.room.users[index].inRoom = true;
                var u = snusBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                snusBot.room.users.push(new snusBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < snusBot.room.users.length; j++) {
                if (snusBot.userUtilities.getUser(snusBot.room.users[j]).id === user.id) {
                    snusBot.userUtilities.setLastActivity(snusBot.room.users[j]);
                    snusBot.room.users[j].jointime = Date.now();
                }

            }
            if (snusBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(snusBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(snusBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < snusBot.room.users.length; i++) {
                if (snusBot.room.users[i].id === user.id) {
                    snusBot.userUtilities.updateDC(snusBot.room.users[i]);
                    snusBot.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < snusBot.room.users.length; i++) {
                if (snusBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        snusBot.room.users[i].votes.woot++;
                    }
                    else {
                        snusBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();

            if (snusBot.settings.voteSkip) {
                if ((mehs - woots) >= (snusBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(snusBot.chat.voteskipexceededlimit, {name: dj.username, limit: snusBot.settings.voteSkipLimit}));
                    API.moderateForceSkip();
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < snusBot.room.users.length; i++) {
                if (snusBot.room.users[i].id === obj.user.id) {
                    snusBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            $("#woot").click(); // autowoot

            var user = snusBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < snusBot.room.users.length; i++){
                if(snusBot.room.users[i].id === user.id){
                    snusBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (snusBot.settings.songstats) {
                if (typeof snusBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(snusBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            snusBot.room.roomstats.totalWoots += lastplay.score.positive;
            snusBot.room.roomstats.totalMehs += lastplay.score.negative;
            snusBot.room.roomstats.totalCurates += lastplay.score.grabs;
            snusBot.room.roomstats.songCount++;
            snusBot.roomUtilities.intervalMessage();
            snusBot.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in snusBot.room.blacklists) {
                if (snusBot.settings.blacklistEnabled) {
                    if (snusBot.room.blacklists[bl].indexOf(mid) > -1) {
                        API.sendChat(subChat(snusBot.chat.isblacklisted, {blacklist: bl}));
                        return API.moderateForceSkip();
                    }
                }
            }
            clearTimeout(historySkip);
            if (snusBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            API.sendChat(subChat(snusBot.chat.songknown, {name: name}));
                            API.moderateForceSkip();
                            snusBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                        }
                    }
                    if (!alreadyPlayed) {
                        snusBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            var newMedia = obj.media;
            if (snusBot.settings.timeGuard && newMedia.duration > snusBot.settings.maximumSongLength * 60 && !snusBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(snusBot.chat.timelimit, {name: name, maxlength: snusBot.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(snusBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(snusBot.room.autoskipTimer);
            if (snusBot.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                snusBot.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (snusBot.room.queue.id.length > 0 && snusBot.room.queueable) {
                    snusBot.room.queueable = false;
                    setTimeout(function () {
                        snusBot.room.queueable = true;
                    }, 500);
                    snusBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = snusBot.room.queue.id.splice(0, 1)[0];
                            pos = snusBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    snusBot.room.queueing--;
                                    if (snusBot.room.queue.id.length === 0) setTimeout(function () {
                                        snusBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + snusBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = snusBot.userUtilities.lookupUser(users[i].id);
                snusBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!snusBot.settings.filterChat) return false;
            if (snusBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(snusBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(snusBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < snusBot.chatUtilities.spam.length; j++) {
                if (msg === snusBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(snusBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = snusBot.userUtilities.getPermission(chat.uid);
                var user = snusBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < snusBot.room.mutedUsers.length; i++) {
                    if (snusBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (snusBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (snusBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(snusBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(snusBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = snusBot.chat.roulettejoin;
                var rlLeaveChat = snusBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === snusBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = snusBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !snusBot.room.usercommand) return void (0);
                    if (!snusBot.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && snusBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = snusBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in snusBot.commands) {
                    var cmdCall = snusBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (snusBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            snusBot.commands[comm].functionality(chat, snusBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    snusBot.room.usercommand = false;
                    setTimeout(function () {
                        snusBot.room.usercommand = true;
                    }, snusBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    if (snusBot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }
                    snusBot.room.allcommand = false;
                    setTimeout(function () {
                        snusBot.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = snusBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < snusBot.room.users.length; j++) {
                        if (snusBot.userUtilities.getUser(snusBot.room.users[j]).id === chat.uid) {
                            snusBot.userUtilities.setLastActivity(snusBot.room.users[j]);
                        }

                    }
                }
                snusBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (snusBot.userUtilities.getPermission(u) < 2) return API.chatLog(snusBot.chat.greyuser);
            if (snusBot.userUtilities.getPermission(u) === 2) API.chatLog(snusBot.chat.bouncer);
            snusBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };

            var roomURL = window.location.pathname;
            var Check;

            var detect = function(){
                if(roomURL != window.location.pathname){
                    clearInterval(Check)
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    snusBot.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                }
            };

            Check = setInterval(function(){ detect() }, 100);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = snusBot;
            snusBot.roomUtilities.updateBlacklists();
            setInterval(snusBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            snusBot.getNewBlacklistedSongs = snusBot.roomUtilities.exportNewBlacklistedSongs;
            snusBot.logNewBlacklistedSongs = snusBot.roomUtilities.logNewBlacklistedSongs;
            if (snusBot.room.roomstats.launchTime === null) {
                snusBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < snusBot.room.users.length; j++) {
                snusBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < snusBot.room.users.length; j++) {
                    if (snusBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    snusBot.room.users[ind].inRoom = true;
                }
                else {
                    snusBot.room.users.push(new snusBot.User(userlist[i].id, userlist[i].username));
                    ind = snusBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(snusBot.room.users[ind].id) + 1;
                snusBot.userUtilities.updatePosition(snusBot.room.users[ind], wlIndex);
            }
            snusBot.room.afkInterval = setInterval(function () {
                snusBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            snusBot.room.autodisableInterval = setInterval(function () {
                snusBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            snusBot.loggedInID = API.getUser().id;
            snusBot.status = true;
            API.sendChat('/cap ' + snusBot.settings.startupCap);
            API.setVolume(snusBot.settings.startupVolume);
            $("#woot").click();
            if (snusBot.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + snusBot.settings.startupCap);
            API.chatLog('Volume set to ' + snusBot.settings.startupVolume);
            loadChat(API.sendChat(subChat(snusBot.chat.online, {botname: snusBot.settings.botName, version: snusBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = snusBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (snusBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },

activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < snusBot.room.users.length; i++) {
                            userTime = snusBot.userUtilities.getLastActivity(snusBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(snusBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (snusBot.room.roomevent) {
                                    snusBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            snusBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(snusBot.chat.maximumafktimeset, {name: chat.un, time: snusBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(snusBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.afkRemoval) {
                            snusBot.settings.afkRemoval = !snusBot.settings.afkRemoval;
                            clearInterval(snusBot.room.afkInterval);
                            API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.afkremoval}));
                        }
                        else {
                            snusBot.settings.afkRemoval = !snusBot.settings.afkRemoval;
                            snusBot.room.afkInterval = setInterval(function () {
                                snusBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        snusBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(snusBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = snusBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = snusBot.roomUtilities.msToStr(inactivity);

                        var launchT = snusBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(snusBot.chat.inactivelonger, {botname: snusBot.settings.botName, name: chat.un, username: name}));
                        } else {
                        API.sendChat(subChat(snusBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.autodisable) {
                            snusBot.settings.autodisable = !snusBot.settings.autodisable;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.autodisable}));
                        }
                        else {
                            snusBot.settings.autodisable = !snusBot.settings.autodisable;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.room.autoskip) {
                            snusBot.room.autoskip = !snusBot.room.autoskip;
                            clearTimeout(snusBot.room.autoskipTimer);
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.autoskip}));
                        }
                        else {
                            snusBot.room.autoskip = !snusBot.room.autoskip;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(snusBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(snusBot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var crowd = API.getUsers();
                            var msg = chat.message;
                            var argument = msg.substring(cmd.length + 1);
                            var randomUser = Math.floor(Math.random() * crowd.length);
                            var randomBall = Math.floor(Math.random() * snusBot.chat.balls.length);
                            var randomSentence = Math.floor(Math.random() * 1);
                            API.sendChat(subChat(snusBot.chat.ball, {name: chat.un, botname: snusBot.settings.botName, question: argument, response: snusBot.chat.balls[randomBall]}));
                     }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof snusBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(snusBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            snusBot.room.newBlacklisted.push(track);
                            snusBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(snusBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof snusBot.room.newBlacklistedSongFunction === 'function') {
                                snusBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(snusBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (snusBot.settings.bouncerPlus) {
                            snusBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!snusBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = snusBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    snusBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(snusBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(snusBot.chat.currentbotname, {botname: snusBot.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            snusBot.settings.botName = argument;
                            API.sendChat(subChat(snusBot.chat.botnameset, {botName: snusBot.settings.botName}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(snusBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(snusBot.chat.commandslink, {botname: snusBot.settings.botName, link: snusBot.cmdLink}));
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.cmdDeletion) {
                            snusBot.settings.cmdDeletion = !snusBot.settings.cmdDeletion;
                            API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.cmddeletion}));
                        }
                        else {
                            snusBot.settings.cmdDeletion = !snusBot.settings.cmdDeletion;
                            API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.cmddeletion}));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * snusBot.chat.cookies.length);
                    return snusBot.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(snusBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = snusBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(snusBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(snusBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(snusBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        snusBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.cycleGuard) {
                            snusBot.settings.cycleGuard = !snusBot.settings.cycleGuard;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.cycleguard}));
                        }
                        else {
                            snusBot.settings.cycleGuard = !snusBot.settings.cycleGuard;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            snusBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(snusBot.chat.cycleguardtime, {name: chat.un, time: snusBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = snusBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(snusBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = snusBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == "undefined"){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(snusBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },*/

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(snusBot.chat.emojilist, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = snusBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch(lang){
                            case 'en': break;
                            case 'da': ch += 'Vær venlig at tale engelsk.'; break;
                            case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                            case 'es': ch += 'Por favor, hable Inglés.'; break;
                            case 'fr': ch += 'Parlez anglais, s\'il vous plaît.'; break;
                            case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                            case 'pl': ch += 'Proszę mówić po angielsku.'; break;
                            case 'pt': ch += 'Por favor, fale Inglês.'; break;
                            case 'sk': ch += 'Hovorte po anglicky, prosím.'; break;
                            case 'cs': ch += 'Mluvte prosím anglicky.'; break;
                            case 'sr': ch += 'Молим Вас, говорите енглески.'; break;                                  
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = snusBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(snusBot.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = snusBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(snusBot.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof snusBot.settings.fbLink === "string")
                            API.sendChat(subChat(snusBot.chat.facebook, {link: snusBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.filterChat) {
                            snusBot.settings.filterChat = !snusBot.settings.filterChat;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.chatfilter}));
                        }
                        else {
                            snusBot.settings.filterChat = !snusBot.settings.filterChat;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.chatfilter}));
                        }
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(snusBot.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(snusBot.chat.notghosting, {name1: chat.un, name2: name}));     
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", 
                                    { 
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(snusBot.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(snusBot.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", 
                                    { 
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(snusBot.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(snusBot.chat.invalidgifrandom, {name: chat.un}));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(snusBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.historySkip) {
                            snusBot.settings.historySkip = !snusBot.settings.historySkip;
                            API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.historyskip}));
                        }
                        else {
                            snusBot.settings.historySkip = !snusBot.settings.historySkip;
                            API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.historyskip}));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.room.roulette.rouletteStatus && snusBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            snusBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(snusBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = snusBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = snusBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(snusBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = snusBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = snusBot.userUtilities.getPermission(chat.uid);
                        var permTokick = snusBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(snusBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(snusBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(snusBot.chat.kill);
                        snusBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(snusBot.chat.currentlang, {language: snusBot.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Kryptonkakan/basicBot/master/lang/langIndex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(snusBot.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                snusBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(snusBot.chat.langset, {language: snusBot.settings.language}));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = snusBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            snusBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(snusBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = snusBot.userUtilities.lookupUser(chat.uid);
                        var perm = snusBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "http://youtu.be/" + media.cid;
                                API.sendChat(subChat(snusBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(snusBot.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        snusBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = snusBot.settings.lockdownEnabled;
                        snusBot.settings.lockdownEnabled = !temp;
                        if (snusBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.lockGuard) {
                            snusBot.settings.lockGuard = !snusBot.settings.lockGuard;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.lockguard}));
                        }
                        else {
                            snusBot.settings.lockGuard = !snusBot.settings.lockGuard;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            snusBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(snusBot.chat.usedlockskip, {name: chat.un}));
                                snusBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    snusBot.room.skippable = false;
                                    setTimeout(function () {
                                        snusBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        snusBot.userUtilities.moveUser(id, snusBot.settings.lockskipPosition, false);
                                        snusBot.room.queueable = true;
                                        setTimeout(function () {
                                            snusBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < snusBot.settings.lockskipReasons.length; i++) {
                                var r = snusBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += snusBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(snusBot.chat.usedlockskip, {name: chat.un}));
                                snusBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    snusBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        snusBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        snusBot.userUtilities.moveUser(id, snusBot.settings.lockskipPosition, false);
                                        snusBot.room.queueable = true;
                                        setTimeout(function () {
                                            snusBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            snusBot.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(snusBot.chat.lockskippos, {name: chat.un, position: snusBot.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            snusBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(snusBot.chat.lockguardtime, {name: chat.un, time: snusBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(snusBot.chat.logout, {name: chat.un, botname: snusBot.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            snusBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(snusBot.chat.maxlengthtime, {name: chat.un, time: snusBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + snusBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!snusBot.settings.motdEnabled) snusBot.settings.motdEnabled = !snusBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            snusBot.settings.motd = argument;
                            API.sendChat(subChat(snusBot.chat.motdset, {msg: snusBot.settings.motd}));
                        }
                        else {
                            snusBot.settings.motdInterval = argument;
                            API.sendChat(subChat(snusBot.chat.motdintervalset, {interval: snusBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === snusBot.loggedInID) return API.sendChat(subChat(snusBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(snusBot.chat.move, {name: chat.un}));
                            snusBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(snusBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = snusBot.userUtilities.getPermission(chat.uid);
                        var permUser = snusBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             snusBot.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(snusBot.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(snusBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = snusBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             snusBot.room.mutedUsers.splice(indexMuted);
                             var u = snusBot.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(snusBot.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(snusBot.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(snusBot.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(snusBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(snusBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(snusBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(snusBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof snusBot.settings.opLink === "string")
                            return API.sendChat(subChat(snusBot.chat.oplist, {link: snusBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(snusBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        snusBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(snusBot.chat.reload);
                        storeToStorage();
                        snusBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(snusBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = snusBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(snusBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.etaRestriction) {
                            snusBot.settings.etaRestriction = !snusBot.settings.etaRestriction;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.etarestriction}));
                        }
                        else {
                            snusBot.settings.etaRestriction = !snusBot.settings.etaRestriction;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!snusBot.room.roulette.rouletteStatus) {
                            snusBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof snusBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(snusBot.chat.roomrules, {link: snusBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = snusBot.room.roomstats.totalWoots;
                        var mehs = snusBot.room.roomstats.totalMehs;
                        var grabs = snusBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(snusBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(snusBot.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        snusBot.room.skippable = false;
                        setTimeout(function () {
                            snusBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.songstats) {
                            snusBot.settings.songstats = !snusBot.settings.songstats;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.songstats}));
                        }
                        else {
                            snusBot.settings.songstats = !snusBot.settings.songstats;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me This bot was created by ' + botCreator + ', but is now maintained by ' + botMaintainer + ".");
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += snusBot.chat.afkremoval + ': ';
                        if (snusBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += snusBot.chat.afksremoved + ": " + snusBot.room.afkList.length + '. ';
                        msg += snusBot.chat.afklimit + ': ' + snusBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (snusBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                                                
                        msg += snusBot.chat.blacklist + ': ';
                        if (snusBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.lockguard + ': ';
                        if (snusBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.cycleguard + ': ';
                        if (snusBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.timeguard + ': ';
                        if (snusBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.chatfilter + ': ';
                        if (snusBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.historyskip + ': ';
                        if (snusBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.voteskip + ': ';
                        if (snusBot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.cmddeletion + ': ';
                        if (snusBot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += snusBot.chat.autoskip + ': ';
                        if (snusBot.room.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        
                        var launchT = snusBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = snusBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(snusBot.chat.activefor, {time: since});

                        return API.sendChat(msg);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = snusBot.userUtilities.lookupUserName(name1);
                        var user2 = snusBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(snusBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === snusBot.loggedInID || user2.id === snusBot.loggedInID) return API.sendChat(subChat(snusBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(snusBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(snusBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            snusBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                snusBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            snusBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                snusBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof snusBot.settings.themeLink === "string")
                            API.sendChat(subChat(snusBot.chat.genres, {link: snusBot.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.timeGuard) {
                            snusBot.settings.timeGuard = !snusBot.settings.timeGuard;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.timeguard}));
                        }
                        else {
                            snusBot.settings.timeGuard = !snusBot.settings.timeGuard;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = snusBot.settings.blacklistEnabled;
                        snusBot.settings.blacklistEnabled = !temp;
                        if (snusBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.blacklist}));
                    }
                }
            },
                        
            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.motdEnabled) {
                            snusBot.settings.motdEnabled = !snusBot.settings.motdEnabled;
                            API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.motd}));
                        }
                        else {
                            snusBot.settings.motdEnabled = !snusBot.settings.motdEnabled;
                            API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.motd}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.voteSkip) {
                            snusBot.settings.voteSkip = !snusBot.settings.voteSkip;
                            API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.voteskip}));
                        }
                        else {
                            snusBot.settings.voteSkip = !snusBot.settings.voteSkip;
                            API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.voteskip}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(snusBot.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        snusBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = snusBot.userUtilities.getPermission(chat.uid);
                        /**
                         if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                snusBot.room.mutedUsers = [];
                                return API.sendChat(subChat(snusBot.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(snusBot.chat.unmuteeveryonerank, {name: chat.un}));
                        }
                         **/
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = snusBot.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = snusBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             var muted = snusBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === user.id) {
                             indexMuted = i;
                             wasMuted = true;
                             }

                             }
                             if (!wasMuted) return API.sendChat(subChat(snusBot.chat.notmuted, {name: chat.un}));
                             snusBot.room.mutedUsers.splice(indexMuted);
                             API.sendChat(subChat(snusBot.chat.unmuted, {name: chat.un, username: name}));
                             */
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(snusBot.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(snusBot.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(snusBot.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            snusBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(snusBot.chat.commandscd, {name: chat.un, time: snusBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(snusBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.usercommands}));
                            snusBot.settings.usercommandsEnabled = !snusBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.usercommands}));
                            snusBot.settings.usercommandsEnabled = !snusBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(snusBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = snusBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(snusBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(snusBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(snusBot.chat.voteskiplimit, {name: chat.un, limit: snusBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!snusBot.settings.voteSkip) snusBot.settings.voteSkip = !snusBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(snusBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            snusBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(snusBot.chat.voteskipsetlimit, {name: chat.un, limit: snusBot.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (snusBot.settings.welcome) {
                            snusBot.settings.welcome = !snusBot.settings.welcome;
                            return API.sendChat(subChat(snusBot.chat.toggleoff, {name: chat.un, 'function': snusBot.chat.welcomemsg}));
                        }
                        else {
                            snusBot.settings.welcome = !snusBot.settings.welcome;
                            return API.sendChat(subChat(snusBot.chat.toggleon, {name: chat.un, 'function': snusBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof snusBot.settings.website === "string")
                            API.sendChat(subChat(snusBot.chat.website, {link: snusBot.settings.website}));
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i){
                            if (users[i].username == name){
                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;
                                if (rawlang == "en"){
                                    var language = "English";
                                } else if (rawlang == "bg"){
                                    var language = "Bulgarian";
                                } else if (rawlang == "cs"){
                                    var language = "Czech";
                                } else if (rawlang == "fi"){
                                    var language = "Finnish"
                                } else if (rawlang == "fr"){
                                    var language = "French"
                                } else if (rawlang == "pt"){
                                    var language = "Portuguese"
                                } else if (rawlang == "zh"){
                                    var language = "Chinese"
                                } else if (rawlang == "sk"){
                                    var language = "Slovak"
                                } else if (rawlang == "nl"){
                                    var language = "Dutch"
                                } else if (rawlang == "ms"){
                                    var language = "Malay"
                                }
                                var rawstatus = API.getUser(id).status;
                                if (rawstatus == "0"){
                                    var status = "Available";
                                } else if (rawstatus == "1"){
                                    var status = "Away";
                                } else if (rawstatus == "2"){
                                    var status = "Working";
                                } else if (rawstatus == "3"){
                                    var status = "Gaming"
                                }
                                var rawrank = API.getUser(id).role;
                                if (rawrank == "0"){
                                    var rank = "User";
                                } else if (rawrank == "1"){
                                    var rank = "Resident DJ";
                                } else if (rawrank == "2"){
                                    var rank = "Bouncer";
                                } else if (rawrank == "3"){
                                    var rank = "Manager"
                                } else if (rawrank == "4"){
                                    var rank = "Co-Host"
                                } else if (rawrank == "5"){
                                    var rank = "Host"
                                } else if (rawrank == "7"){
                                    var rank = "Brand Ambassador"
                                } else if (rawrank == "10"){
                                    var rank = "Admin"
                                }
                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = ", Profile: http://plug.dj/@/" + slug;
                                } else {
                                    var profile = "";
                                }

                                API.sendChat(subChat(snusBot.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, status: status, joined: joined, rank: rank}));
                            }
                        }
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!snusBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof snusBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(snusBot.chat.youtube, {name: chat.un, link: snusBot.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(snusBot.startup);
}).call(this);

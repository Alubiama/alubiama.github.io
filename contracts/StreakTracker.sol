// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StreakTracker
 * @notice On-chain daily streak tracking for Still Basing
 * @dev Simple, gas-efficient contract for Base blockchain
 */
contract StreakTracker {

    struct UserData {
        uint32 currentStreak;
        uint32 longestStreak;
        uint40 lastCheckIn;     // Unix timestamp
        uint32 totalCheckIns;
    }

    mapping(address => UserData) public users;

    uint256 public constant COOLDOWN = 20 hours;
    uint256 public constant STREAK_WINDOW = 48 hours;

    event CheckIn(address indexed user, uint32 newStreak, uint40 timestamp);
    event StreakReset(address indexed user, uint32 previousStreak);
    event NewLongestStreak(address indexed user, uint32 streak);

    error TooSoon(uint256 timeRemaining);

    /**
     * @notice Record a daily check-in
     * @dev Updates streak, handles resets, emits events
     */
    function checkIn() external {
        UserData storage user = users[msg.sender];
        uint40 now_ = uint40(block.timestamp);

        // Enforce cooldown
        if (user.lastCheckIn > 0) {
            uint256 elapsed = now_ - user.lastCheckIn;
            if (elapsed < COOLDOWN) {
                revert TooSoon(COOLDOWN - elapsed);
            }

            // Check if streak should reset (missed the window)
            if (elapsed > STREAK_WINDOW) {
                emit StreakReset(msg.sender, user.currentStreak);
                user.currentStreak = 0;
            }
        }

        // Increment streak
        user.currentStreak++;
        user.totalCheckIns++;
        user.lastCheckIn = now_;

        // Update longest streak if needed
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
            emit NewLongestStreak(msg.sender, user.longestStreak);
        }

        emit CheckIn(msg.sender, user.currentStreak, now_);
    }

    /**
     * @notice Get user's current streak status
     * @param user Address to check
     * @return currentStreak Current streak count
     * @return longestStreak All-time longest streak
     * @return lastCheckIn Last check-in timestamp
     * @return totalCheckIns Total number of check-ins
     * @return canCheckIn Whether user can check in now
     * @return timeUntilCheckIn Seconds until next check-in (0 if can check in)
     */
    function getStatus(address user) external view returns (
        uint32 currentStreak,
        uint32 longestStreak,
        uint40 lastCheckIn,
        uint32 totalCheckIns,
        bool canCheckIn,
        uint256 timeUntilCheckIn
    ) {
        UserData storage data = users[user];
        currentStreak = data.currentStreak;
        longestStreak = data.longestStreak;
        lastCheckIn = data.lastCheckIn;
        totalCheckIns = data.totalCheckIns;

        if (data.lastCheckIn == 0) {
            canCheckIn = true;
            timeUntilCheckIn = 0;
        } else {
            uint256 elapsed = block.timestamp - data.lastCheckIn;
            if (elapsed >= COOLDOWN) {
                canCheckIn = true;
                timeUntilCheckIn = 0;

                // If streak expired, current streak would be 0 on next check-in
                if (elapsed > STREAK_WINDOW) {
                    currentStreak = 0;
                }
            } else {
                canCheckIn = false;
                timeUntilCheckIn = COOLDOWN - elapsed;
            }
        }
    }

    /**
     * @notice Get multiple users' streaks (for leaderboard)
     * @param addresses Array of addresses to query
     * @return streaks Array of current streaks
     */
    function getStreaks(address[] calldata addresses) external view returns (uint32[] memory streaks) {
        streaks = new uint32[](addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            UserData storage data = users[addresses[i]];

            // Check if streak is still valid
            if (data.lastCheckIn > 0 && block.timestamp - data.lastCheckIn > STREAK_WINDOW) {
                streaks[i] = 0;
            } else {
                streaks[i] = data.currentStreak;
            }
        }
    }
}

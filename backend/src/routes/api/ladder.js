"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const cache_1 = __importDefault(require("../../utils/cache"));
const utils_1 = require("../../utils/utils");
const problem_1 = __importDefault(require("./../../models/problem"));
const router = express_1.default.Router();
const ladderLimit = 100;
const fetchLadderLimit = 120;
const isEligibleForCache = (startRating, endRating) => {
    const start = parseInt(startRating, 10);
    const end = parseInt(endRating, 10);
    if (start % 100 == 0 && end % 100 == 0 && end - start === 100) {
        return true;
    }
    return false;
};
router.get('/ladder', (req, res) => {
    const { startRating, endRating } = req.query;
    if (!startRating || !endRating) {
        return (0, utils_1.sendError)(res, 'Missing startRating or endRating', 'Missing startRating or endRating', 400);
    }
    if (isNaN(parseInt(startRating, 10)) || isNaN(parseInt(endRating, 10))) {
        return (0, utils_1.sendError)(res, 'Invalid startRating or endRating', 'Invalid startRating or endRating', 400);
    }
    const useCache = isEligibleForCache(startRating, endRating);
    if (useCache) {
        const result = cache_1.default.get(`ladder:${startRating}:${endRating}`);
        if (result) {
            return (0, utils_1.sendSuccess)(res, 'Ladder fetched', result);
        }
    }
    problem_1.default.find({
        rating: {
            $gte: startRating,
            $lt: endRating,
        },
    })
        .sort({ frequency: -1 })
        .limit(fetchLadderLimit)
        .exec()
        .then((result) => {
        const problems = result;
        const uniqueProblems = new Set();
        const finalRes = [];
        const deltaContestIds = [1, 0, -1];
        for (const problem of problems) {
            const { contestId, name } = problem;
            const cid = parseInt(contestId, 10);
            let present = false;
            for (const deltaContestId of deltaContestIds) {
                if (uniqueProblems.has(`${cid + deltaContestId}:${name}`)) {
                    present = true;
                    break;
                }
            }
            uniqueProblems.add(`${cid}:${name}`);
            if (present) {
                continue;
            }
            finalRes.push(problem);
            if (finalRes.length === ladderLimit) {
                break;
            }
        }
        (0, utils_1.sendSuccess)(res, 'Ladder fetched', finalRes);
        if (useCache) {
            cache_1.default.set(`ladder:${startRating}:${endRating}`, finalRes);
        }
    })
        .catch((err) => {
        (0, utils_1.sendError)(res, 'Internal Server Error', 'Error while fetching problems');
    });
});
module.exports = router;

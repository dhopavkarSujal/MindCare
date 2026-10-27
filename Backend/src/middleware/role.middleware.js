export function requireCounselor(req, res, next) {
  if (req.user?.role !== "COUNSELOR") {
    return res.status(403).json({
      success: false,
      message: "Counsellor access is required.",
    });
  }
  return next();
}

export function requireStudent(req, res, next) {
  if (req.user?.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Student access is required to manage student appointments.",
    });
  }
  return next();
}

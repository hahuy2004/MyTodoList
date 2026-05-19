export const FilterType = {
  all: "Tất cả",
  active: "Đang làm",
  completed: "Hoàn thành",
};

export const options = [
  {
    value: "today",
    label: "Hôm nay",
  },
  {
    value: "tomorrow",
    label: "Ngày mai",
  },
  {
    value: "week",
    label: "Tuần này",
  },
  {
    value: "month",
    label: "Tháng này",
  },
  {
    value: "all",
    label: "Tất cả",
  },
];

export const sortOptions = [
  {
    value: "deadline",
    label: "Deadline",
  },
  {
    value: "createdAt",
    label: "Ngày tạo",
  },
];

export const visibleTaskLimit = 4;
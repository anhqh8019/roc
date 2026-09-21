// src/components/AlertCenter.tsx

type AlertLevel =
  | "critical"
  | "warning"
  | "info";

interface AlertItem {
  id: number;
  level: AlertLevel;
  title: string;
  message: string;
  time: string;
}

const mockAlerts: AlertItem[] = [
  {
    id: 1,
    level: "critical",
    title: "Công suất phòng thấp",
    message:
      "Occupancy ngày 03/09 giảm xuống dưới 10%.",
    time: "10 phút trước",
  },
  {
    id: 2,
    level: "warning",
    title: "RevPAR thấp",
    message:
      "RevPAR hiện thấp hơn ngưỡng kỳ vọng.",
    time: "25 phút trước",
  },
  {
    id: 3,
    level: "warning",
    title: "Housekeeping",
    message:
      "Hiện còn 20 phòng đang ở trạng thái Dirty.",
    time: "32 phút trước",
  },
  {
    id: 4,
    level: "info",
    title: "Doanh thu F&B",
    message:
      "Doanh thu F&B hôm nay đạt 9.600.000 đ.",
    time: "1 giờ trước",
  },
  {
    id: 5,
    level: "info",
    title: "Hệ thống",
    message:
      "Đồng bộ dữ liệu Smile hoàn tất.",
    time: "2 giờ trước",
  },
];

export default function AlertCenter() {
  return (
    <div className="alert-center">

      <div className="alert-center-header">
        <div>
          <h3>Cảnh báo vận hành</h3>

          <span>
            Dữ liệu giả lập
          </span>
        </div>

        <div className="alert-count">
          {mockAlerts.length}
        </div>
      </div>

      <div className="alert-list">

        {mockAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-item alert-${alert.level}`}
          >
            <div
              className="alert-status-dot"
            />

            <div className="alert-content">

              <div className="alert-item-header">
                <strong>
                  {alert.title}
                </strong>

                <span>
                  {alert.time}
                </span>
              </div>

              <p>
                {alert.message}
              </p>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
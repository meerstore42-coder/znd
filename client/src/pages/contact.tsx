import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones } from "lucide-react";

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: t("تم الإرسال بنجاح", "Message Sent Successfully"),
      description: t(
        "سنتواصل معك قريباً",
        "We will contact you soon"
      ),
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      titleAr: "البريد الإلكتروني",
      titleEn: "Email",
      valueAr: "support@znd.com",
      valueEn: "support@znd.com",
    },
    {
      icon: Phone,
      titleAr: "الهاتف",
      titleEn: "Phone",
      valueAr: "+966 50 123 4567",
      valueEn: "+966 50 123 4567",
    },
    {
      icon: MapPin,
      titleAr: "العنوان",
      titleEn: "Address",
      valueAr: "الرياض، المملكة العربية السعودية",
      valueEn: "Riyadh, Saudi Arabia",
    },
    {
      icon: Clock,
      titleAr: "ساعات العمل",
      titleEn: "Working Hours",
      valueAr: "24/7 دعم متواصل",
      valueEn: "24/7 Support",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-20" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text" data-testid="text-contact-title">
                {t("تواصل معنا", "Contact Us")}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t(
                  "نحن هنا لمساعدتك. تواصل معنا في أي وقت",
                  "We're here to help. Contact us anytime"
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="glass-card rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <div className="h-14 w-14 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                      <info.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      {t(info.titleAr, info.titleEn)}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(info.valueAr, info.valueEn)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">
                    {t("أرسل لنا رسالة", "Send Us a Message")}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("الاسم", "Name")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="glass-input"
                        required
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("البريد الإلكتروني", "Email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="glass-input"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("الموضوع", "Subject")}</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="glass-input"
                      required
                      data-testid="input-subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("الرسالة", "Message")}</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="glass-input resize-none"
                      required
                      data-testid="input-message"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 glass-button"
                    disabled={isSubmitting}
                    data-testid="button-submit-contact"
                  >
                    {isSubmitting ? (
                      t("جاري الإرسال...", "Sending...")
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("إرسال الرسالة", "Send Message")}
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <div className="liquid-glass rounded-3xl p-8 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <Headphones className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">
                    {t("الدعم الفني", "Technical Support")}
                  </h2>
                </div>
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    {t(
                      "فريق الدعم الفني متاح على مدار الساعة لمساعدتك في أي استفسار أو مشكلة تواجهك. نحن نسعى لتقديم أفضل تجربة ممكنة.",
                      "Our technical support team is available 24/7 to help you with any questions or issues. We strive to provide the best possible experience."
                    )}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{t("الدعم عبر البريد", "Email Support")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("رد خلال ساعة واحدة", "Response within 1 hour")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{t("الدردشة المباشرة", "Live Chat")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("متاح 24/7", "Available 24/7")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
